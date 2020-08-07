import { Response, Request } from "express";
import db from "../database/connection";
import converter from "../utils/converter";

interface ScheduleItem {
    week_day: number;
    from: string;
    to: string;
}

export default class ClassesController {
    async index(request: Request, response: Response) {
        try {
            console.log('classes index', request.query);

            const filters = request.query;

            const week_day = (filters.week_day) ? Number(filters.week_day as string) : -1;
            const subject = filters.subject as string;
            const time = filters.time as string;
            const timeInMinutes = (time) ? converter.hourToMinutes(time) : 0;

            console.log('filtering Classes', {week_day, subject, time, timeInMinutes});

            const classes = await db('classes')
                .whereExists(function() {
                    this.select('class_schedule.*')
                    .from('class_schedule')
                    .whereRaw('`class_schedule`.`class_id` = `classes`.`id`')
                    .modify(function(queryBuilder) {
                        if (week_day >= 0 && week_day <= 6) {
                            queryBuilder.whereRaw('`class_schedule`.`week_day` = ??', [week_day])
                        }
                        if (timeInMinutes) {
                            queryBuilder
                                .whereRaw('`class_schedule`.`from` <= ??', [timeInMinutes])
                                .whereRaw('`class_schedule`.`to` > ??', [timeInMinutes])
                        }
                    })
                })
                .modify(function(queryBuilder) {
                    if (subject) {
                        queryBuilder.where('classes.subject', '=', subject)
                    }
                })
                .join('users', 'classes.user_id', '=', 'users.id')
                .select(['classes.*', 'users.*']);

            console.log('Filtered Classes', classes);
            return response.status(200).json(classes);
        } catch (err) {
            console.log('Falha na execução', err);
            return response.status(400).json({error: err});
        }

    }

    async create(request: Request, response: Response) {
        console.log('classes create', request.body);

        const {
            name,
            avatar,
            whatsapp,
            bio,
            subject,
            cost,
            schedule
        } = request.body;
    
        const trx = await  db.transaction();
    
        try {
            const insertedUsersIds = await trx('users')
                .insert({name, avatar, whatsapp, bio});
            const user_id = insertedUsersIds[0];
    
            const insertedClassesIds = await trx('classes')
                .insert({subject, cost, user_id});
            const class_id = insertedClassesIds[0]; 
    
            const classSchedule = schedule.map((item: ScheduleItem) =>{
                return {
                    week_day: item.week_day,
                    from: converter.hourToMinutes(item.from),
                    to: converter.hourToMinutes(item.to),
                    class_id
                }
            })
    
            await trx('class_schedule').insert(classSchedule);
    
            await trx.commit();
    
            return response.status(201).send();
        } catch (err) {
            console.log(err);
            await trx.rollback();
            return response.status(400).json({
                error: 'Unexpected error while creating new class'
            })
        }
    }
}