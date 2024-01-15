import { randomUUID } from 'crypto';
import { faker } from '@faker-js/faker';
import express from 'express';
import cors from 'cors';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const app = express();
app.use(express.json());
app.use(
    cors({
        origin: 'http://127.0.0.1:5500',
        preflightContinue: true,
    }),
);

const verifyJwt = function (req, res, next) {
    const accessToken = req.get('Authorization');

    jwt.verify(accessToken.split(' ')[1], "growdev", (err, idUsuario) => {
        if (err) {
            return res.status(403).json("Access token inválido");
        }
        req.user = idUsuario;
        next();
    });
};

// Implementação fictícia dos usuários e recados
const usuarios = [
    {
        id: randomUUID(),
        nome: "Leonardo Krindges",
        email: "leonardo@mail.com",
        senha: "$2a$06$oWaGUzjgm8wGpV8otyteyuuiLM3blA6ul2q.X3X6df33zLStZBwXK",
        recados: [
            {
                id: randomUUID(),
                titulo: "Passeio bob",
                descricao: "Levar no parque"
            }
        ]
    },
    {
        id: randomUUID(),
        nome: "Jéssica Stein",
        email: "jessica@mail.com",
        senha: "$2a$06$6aRs1GjmDyjTFUPzJWqx7OohIj74m4KNOhMoCE9LjLp6e/.BZgJOe",
        recados: [
            {
                id: randomUUID(),
                titulo: "Tomar remédio",
                descricao: "Tomar às 12h"
            }
        ]
    },
    // ... outros usuários ...
];

// Adiciona recados aleatórios para o primeiro usuário
for (let i = 0; i < 12; i++) {
    const recado = {
        id: randomUUID(),
        titulo: faker.lorem.word(),
        descricao: faker.lorem.paragraph()
    };
    usuarios[0].recados.push(recado);
}

// Adiciona usuários fictícios
for (let i = 0; i < 100; i++) {
    const usuario = {
        id: randomUUID(),
        nome: faker.person.fullName(),
        email: faker.internet.email(),
        senha: "$2a$06$oWaGUzjgm8wGpV8otyteyuuiLM3blA6ul2q.X3X6df33zLStZBwXK",
        recados: [
            {
                id: randomUUID(),
                titulo: "Passeio bob",
                descricao: "Levar no parque"
            }
        ]
    };
    usuarios.push(usuario);
}

// Rota para listagem de recados com paginação
app.get('/recados/listagem/', verifyJwt, (request, response) => {
    const accessToken = request.user;
    const quantidadeRecadosPorPagina = request.query.pageSize || 4;
    const pagina = request.query.page || 1;

    const pegaUsuariosPeloIndice = usuarios.findIndex((usuario) => {
        return usuario.id == accessToken.usuarioId;
    });

    if (pegaUsuariosPeloIndice === -1) {
        return response.status(400).json("Usuario não encontrado");
    }

    const recadosUsuario = usuarios[pegaUsuariosPeloIndice].recados;

    const inicioIndex = (pagina - 1) * quantidadeRecadosPorPagina;
    const fimIndex = inicioIndex + quantidadeRecadosPorPagina;

    const recadosPaginados = recadosUsuario.slice(inicioIndex, fimIndex);

    const quantidadeDePaginas = Math.ceil(recadosUsuario.length / quantidadeRecadosPorPagina);

    return response.json({
        recados: recadosPaginados,
        quantidadeDePaginas,
        quantidadeRecadosPorPagina,
    });
});



// Inicia o servidor na porta 8080
app.listen(8080, () => console.log("Servidor iniciado"));
