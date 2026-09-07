import { IMediaProvider } from "./IMediaProvider";

export interface IAudioProvider extends IMediaProvider {
    readonly mediaType: "audio";
}