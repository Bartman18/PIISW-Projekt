package com.piisw.ticket;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class TicketApiTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String login(String username, String password) throws Exception {
        String body = mvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"" + username + "\",\"password\":\"" + password + "\"}"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(body).get("token").asText();
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }

    @Test
    void passengerPurchasesValidatesAndInspectorVerifies() throws Exception {
        String passengerToken = login("pasazer", "pasazer");
        String inspectorToken = login("bileter", "bileter");

        String purchased = mvc.perform(post("/api/passenger/tickets/purchase")
                        .header(HttpHeaders.AUTHORIZATION, bearer(passengerToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"definitionId\":\"def-single-n\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("active"))
                .andExpect(jsonPath("$.type").value("jednorazowy"))
                .andReturn().getResponse().getContentAsString();
        String ticketId = objectMapper.readTree(purchased).get("id").asText();

        mvc.perform(post("/api/passenger/tickets/" + ticketId + "/validate")
                        .header(HttpHeaders.AUTHORIZATION, bearer(passengerToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"vehicleId\":\"TRAM-1234\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("validated"))
                .andExpect(jsonPath("$.vehicleId").value("TRAM-1234"));

        mvc.perform(get("/api/inspector/verify")
                        .header(HttpHeaders.AUTHORIZATION, bearer(inspectorToken))
                        .param("ticketId", ticketId)
                        .param("vehicleId", "TRAM-1234"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(true));
    }

    @Test
    void revalidatingValidatedTicketReturns409() throws Exception {
        String passengerToken = login("pasazer", "pasazer");

        String purchased = mvc.perform(post("/api/passenger/tickets/purchase")
                        .header(HttpHeaders.AUTHORIZATION, bearer(passengerToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"definitionId\":\"def-single-n\"}"))
                .andReturn().getResponse().getContentAsString();
        String ticketId = objectMapper.readTree(purchased).get("id").asText();

        mvc.perform(post("/api/passenger/tickets/" + ticketId + "/validate")
                        .header(HttpHeaders.AUTHORIZATION, bearer(passengerToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"vehicleId\":\"TRAM-1234\"}"))
                .andExpect(status().isOk());

        mvc.perform(post("/api/passenger/tickets/" + ticketId + "/validate")
                        .header(HttpHeaders.AUTHORIZATION, bearer(passengerToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"vehicleId\":\"TRAM-1234\"}"))
                .andExpect(status().isConflict());
    }

    @Test
    void purchaseUnknownDefinitionReturns404() throws Exception {
        String passengerToken = login("pasazer", "pasazer");

        mvc.perform(post("/api/passenger/tickets/purchase")
                        .header(HttpHeaders.AUTHORIZATION, bearer(passengerToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"definitionId\":\"nie-istnieje\"}"))
                .andExpect(status().isNotFound());
    }

    @Test
    void walletWithoutTokenReturns401() throws Exception {
        mvc.perform(get("/api/passenger/wallet"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void passengerCannotAccessInspectorEndpoint() throws Exception {
        String passengerToken = login("pasazer", "pasazer");

        mvc.perform(get("/api/inspector/verify")
                        .header(HttpHeaders.AUTHORIZATION, bearer(passengerToken))
                        .param("ticketId", "TKT-WHATEVER")
                        .param("vehicleId", "TRAM-1234"))
                .andExpect(status().isForbidden());
    }

    @Test
    void inspectorVerifyUnknownTicketReturnsInvalid() throws Exception {
        String inspectorToken = login("bileter", "bileter");

        mvc.perform(get("/api/inspector/verify")
                        .header(HttpHeaders.AUTHORIZATION, bearer(inspectorToken))
                        .param("ticketId", "TKT-NOPE")
                        .param("vehicleId", "TRAM-1234"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(false))
                .andExpect(jsonPath("$.ticket").doesNotExist());
    }
}
