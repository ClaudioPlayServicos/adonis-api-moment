import Application from "@ioc:Adonis/Core/Application";

import { v4 as uuidv4 } from 'uuid';

import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

import Moment from 'App/Models/Moment';

export default class MomentsController {

    //valida a imagem antes de inserir no sistema
    private validationOptions = {
        types: ['image'],
        size: '2mb',
    }

    //desestruturar
    public async store({ request, response }: HttpContextContract) {

        const body = request.body();

        //valida a imagem 
        const image = request.file('image', this.validationOptions);

        // se houver imagem, gera um nome seguro, faz o upload com o nome seguro
        // e joga no body o nome da imagem nova
        if (image) {
            const imageName = `${uuidv4()}.${image.extname}`

            await image.move(Application.tmpPath('uploads'), {
                name: imageName
            });

            body.image = imageName;
        }

        //cria a coluna
        const moment = await Moment.create(body);
        response.status(201)

        return {
            message: 'Momento criado com sucesso!',
            data: moment,
        }

    }

    public async update({ params, request }: HttpContextContract) {

        const body = request.body();

        const moment = await Moment.findOrFail(params.id);

        moment.title = body.title;
        moment.description = body.description;

        if (moment.image != body.image || !moment.image) {

            const image = request.file('image', this.validationOptions);

            if (image) {
                const imageName = `${uuidv4()}.${image.extname}`

                await image.move(Application.tmpPath('uploads'), {
                    name: imageName
                });

                moment.image = imageName;
            }
        }

        await moment.save();

        return {
            message: 'Momento atualizado com sucesso!',
            data: moment,
        }
    }

    public async destroy({ params, }: HttpContextContract) {

        //busca o usuario a ser deletado pelo id
        const moment = await Moment.findOrFail(params.id);

        //deleta o usuario encontrado
        await moment.delete();

        return {
            message: 'Momento excluído com sucesso!',
            data: moment,
        }
    }

    public async index() {

        //mostra todos os dados
        //mostra apenas os moments, sem relações
        //const moments = await Moment.all(); 

        //mostra os moments e os comentarios
        const moments = await Moment.query().preload("comments");
        return {
            data: moments,
        }
    }

}
