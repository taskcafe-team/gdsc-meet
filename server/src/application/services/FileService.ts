import { Injectable } from "@nestjs/common";
import { File, PrismaClient, } from "@prisma/client";
import { writeFile } from "fs/promises";
import { join } from "path";
import { async } from "rxjs";
import { createWriteStream } from "fs";
import { v4 as uuidv4 } from 'uuid';
import { FolderService } from "./FolderService";
@Injectable()
export class FileService {
  constructor(
    private readonly prismaClient: PrismaClient,
    private readonly folderService: FolderService) {
  }

  public async saveFileLocalStorage(file): Promise<string> {
    try {
      const uniqueSuffix = `${uuidv4()}-${Date.now()}`;
      const filename = `${uniqueSuffix}-${file.originalname}`;
      const filePath = join(process.cwd(), 'src//data/', filename);

      console.log(filePath)
      // Sử dụng createWriteStream để ghi file vào ổ đĩa
      const writeStream = createWriteStream(filePath);

      // Ghi dữ liệu từ buffer của file vào stream
      writeStream.write(file.buffer);

      // Kết thúc stream
      writeStream.end();

      // Trả về đường dẫn file đã lưu
      return filePath;
    } catch (error) {
      console.error('Error saving file:', error);
      throw error;
    }
  }
  public async createFile(folderId: string, file) {
    const { originalname, mimetype } = file;
    // console.log('File Name:', originalname);
    // console.log('File Type:', mimetype);

    const filePath = await this.saveFileLocalStorage(file);
    if (folderId === undefined) {
      // Xử lý lỗi hoặc trả về giá trị mặc định nếu tham số là undefined
      throw new Error("Invalid parameters.");
    }
    console.log(folderId)
    if (folderId === null) {
      throw new Error('Failed to create file');
    }

    const createFile = await this.prismaClient.file.create({
      data: {
        // Đặt tên tệp tin tùy thuộc vào logic của bạn 
        name: originalname, // Đặt tên tệp tin tùy thuộc vào logic của bạn
        folder_id: folderId,
        path: filePath,
        type: mimetype,
      },
    });

    return createFile;
  }
  public async getFileContentById(fileId: string): Promise<string | null> {
    console.log(fileId)
    try {
      const file = await this.prismaClient.file.findUnique({
        where: {
          id: fileId,
        },
        select: {
          path: true,
        },
      });

      if (file) {
        return file.path;
      }

      return null; // Trả về null nếu không tìm thấy file với id tương ứng
    } catch (error) {
      // Xử lý lỗi nếu có
      throw new Error('Failed to get file content');
    }
  }
  public async getAllFilesByFolderId(folderId: string): Promise<File[]> {
    const files = await this.prismaClient.file.findMany({
      where: {
        folder_id: folderId,
      },
    });
    console.log(files.length)
    return files;
  }
}