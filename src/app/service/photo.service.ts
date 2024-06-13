import { Injectable } from '@angular/core';
import { Storage, getDownloadURL, list, ref, uploadString } from '@angular/fire/storage';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AuthService } from './auth.service';

export interface UserPhoto {
  name: string;
  webViewPath?: string;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  private readonly NICE_BUCKET = 'mesas';
  private readonly CLIENT_BUCKET = 'clientes';

  nicePhotos: UserPhoto[] = [];
  clientPhotos: UserPhoto[] = [];

  constructor(
    private storage: Storage,
    private authService: AuthService
  ) {
    const niceRef = ref(this.storage, this.NICE_BUCKET);
    const clientPhotos = ref(this.storage, this.CLIENT_BUCKET);

    this.build(niceRef, this.nicePhotos);
    this.build(clientPhotos, this.clientPhotos);
  }

  build(ref: any, photoList: UserPhoto[]) {
    list(ref)
      .then(res => {
        res.items.forEach(photo => {
          getDownloadURL(photo)
            .then(path => {
              const [email, timestamp] = photo.name.split(' ');
              photoList.push({
                name: photo.name,
                webViewPath: path,
                timestamp: parseInt(timestamp)
              });
            });
        });
      })
      .finally(() => {
        // sort by date desc
        photoList.sort((a, b) => b.timestamp - a.timestamp);
      });
  }


  async getPhotoUrl(photoName: string): Promise<string> {
    const storageRef = ref(this.storage, `${this.NICE_BUCKET}/${photoName}`);
    try {
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      console.error('Error getting photo URL:', error);
      return '';
    }
  }

  async addNicePhoto(): Promise<UserPhoto | undefined> {
    return await this.addNewToGallery(this.nicePhotos, this.NICE_BUCKET);
  }

  async addClientPhoto(): Promise<UserPhoto | undefined> {
    return await this.addNewToGallery(this.clientPhotos, this.CLIENT_BUCKET);
  }

  private async addNewToGallery(gallery: UserPhoto[], bucket: string): Promise<UserPhoto | undefined> {
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
      quality: 100
    });

    const date = Date.now();
    const storageRef = ref(this.storage, `${bucket}/${this.authService.actual()} ${date}`);

    try {
      await uploadString(storageRef, `data:image/jpeg;base64, ${capturedPhoto.base64String!}`, 'data_url');
      const webViewPath = await getDownloadURL(storageRef);
      const newPhoto: UserPhoto = {
        name: storageRef.name,
        webViewPath: webViewPath,
        timestamp: date
      };
      gallery.unshift(newPhoto);
      return newPhoto;
    } catch (e: any) {
      console.error('Error uploading photo:', e);
      return undefined;
    }
  }

}
