import Code from "@core/common/constants/Code";
import { Exception } from "@core/common/exception/Exception";

import { Injectable } from "@nestjs/common";
import { PrismaClient, UserMeeting } from "@prisma/client";

@Injectable()
export class UserMeetingService {
    constructor(private readonly prismaClient: PrismaClient) { }

    public async checkUserMeetingExisted(userId: string, meetingId: string): Promise<UserMeeting | null> {
        const result = await this.prismaClient.userMeeting.findMany({
            where: {
                userId: userId,
                meetingId: meetingId,
            },
            take: 1, // Giới hạn số lượng bản ghi trả về thành 1
        });
        return result.length > 0 ? result[0] : null;
    }

    public async findUserMeetingById(userMeetingId: string): Promise<UserMeeting | null> {

        const result = await this.prismaClient.userMeeting.findUnique({
            where: {
                id: userMeetingId,
            },
        });

        return result;
    }
    public async createUserMeeting(userId: string, meetingId: string): Promise<UserMeeting> {
        try {
            const userMeetingExist = await this.checkUserMeetingExisted(userId, meetingId);
    
            if (userMeetingExist) {
                throw new Exception(Code.ENTITY_ALREADY_EXISTED_ERROR);
            }
    
            const createdUserMeeting = await this.prismaClient.userMeeting.create({
                data: {
                    userId: userId,
                    meetingId: meetingId,
                },
            });
    
            return createdUserMeeting;
        } catch (error) {
             console.error('Error creating UserMeeting:', error);
            // Log Prisma errors for further investigation
             console.error('Prisma Error:', error);
            throw error;
        }
    }

    public async getAllUserMeeting(): Promise<UserMeeting[]> {
        try {
            const userSubjects = await this.prismaClient.userMeeting.findMany();
            return userSubjects;
        } catch (error) {
            console.error('Error retrieving all user subjects:', error);
            throw error;
        }
    }
}

