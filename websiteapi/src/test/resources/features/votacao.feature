# language: pt
Funcionalidade: Votação no próximo evento
  Como usuário da Arena Pernambuco
  Quero votar no próximo evento
  Para ajudar a decidir qual evento irá acontecer

  Cenário: Usuário vota em um evento disponível
    Dado que existe um evento chamado "Show do João Gomes"
    Quando eu voto nesse evento
    Então o evento deve ter 1 voto

  Cenário: Usuário não pode votar em um evento cancelado
    Dado que existe um evento cancelado chamado "Show Cancelado"
    Quando eu voto nesse evento
    Então a votação é recusada com a mensagem "Não é possível votar em um evento cancelado"
