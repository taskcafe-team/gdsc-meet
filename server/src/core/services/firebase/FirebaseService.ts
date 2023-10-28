// firebase.service.ts

import { Inject, Injectable } from '@nestjs/common';
import { getStorage, Storage } from 'firebase-admin/storage';
import { App,getApps,initializeApp } from 'firebase-admin/app';
@Injectable()
export class FirebaseService {
  private readonly app: App;
  private readonly storage: Storage;

  constructor(){
    const firebaseConfig = {
      apiKey: "AIzaSyBk5SRxTLoYezQk2C-8W2GkXyak4kZREsI",
      authDomain: "jdscmeeting.firebaseapp.com",
      projectId: "jdscmeeting",
      storageBucket: "jdscmeeting.appspot.com",
      messagingSenderId: "259681179169",
      appId: "1:259681179169:web:c555382ef59b95fd33f560",
      measurementId: "G-71LZXB0R1B"
    };
    // this.app = initializeApp(firebaseConfig, 'second');
    const alreadyCreatedAps = getApps();
    this.app = alreadyCreatedAps.length === 0
    ? initializeApp(firebaseConfig)
    : alreadyCreatedAps[0];
    
    //this.app = initializeApp(firebaseConfig);
    this.storage = getStorage(this.app);
  }
  

  async uploadUserAvatar(userId: string, file: Express.Multer.File): Promise<string> {
    const bucket = await this.storage.bucket();
    console.log(bucket)
    // Tạo tên file duy nhất
    const filename = `${Date.now()}_${file.originalname}`;
    console.log(filename)
  
    // Tạo tên đường dẫn trong Firebase Storage
    const filePath = `files/${userId}/${filename}`;
    console.log(filePath)
  
    // Tạo WriteStream để tải lên file lên Firebase Storage
    const fileUpload = bucket.file(filePath);
    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });
    console.log("fileUpload")

    // Lưu file lên Firebase Storage
    await new Promise((resolve, reject) => {
      stream.on('error', reject);
      stream.on('finish', resolve);
      console.log(resolve)
      console.log(reject)

      stream.end(file.buffer);
    });
  
    // Trả về đường dẫn tới file đã lưu trong Firebase Storage
    console.log("123123123123")

    return filePath;
  }
}
