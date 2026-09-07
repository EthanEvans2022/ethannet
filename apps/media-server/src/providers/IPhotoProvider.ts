import { IMediaProvider } from "./IMediaProvider";

export interface IPhotoProvider extends IMediaProvider {
    readonly mediaType: "photo";
}