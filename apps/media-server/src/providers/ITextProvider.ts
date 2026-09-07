import { IMediaProvider } from "./IMediaProvider";

export interface ITextProvider extends IMediaProvider {
    readonly mediaType: "text";
}