package com.arenape.webapi.entity;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Teste de domínio puro: exercita a regra de votação diretamente na entidade,
 * sem Spring, sem banco e sem nenhuma infraestrutura.
 */
class EventTest {

    @Test
    @DisplayName("o primeiro voto registra 1 voto, mesmo sem inicialização do JPA")
    void primeiroVotoRegistraUmVoto() {
        Event evento = new Event();

        evento.vote();

        assertThat(evento.getVotes()).isEqualTo(1);
    }

    @Test
    @DisplayName("votos consecutivos são acumulados")
    void votosConsecutivosAcumulam() {
        Event evento = new Event();

        evento.vote();
        evento.vote();
        evento.vote();

        assertThat(evento.getVotes()).isEqualTo(3);
    }
}
