import { IMediaProvider } from "./IMediaProvider";

export interface IVideoProvider extends IMediaProvider {
    readonly mediaType: "video";
}