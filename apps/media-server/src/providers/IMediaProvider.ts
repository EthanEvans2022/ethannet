import { MediaFile } from "@ethannet/types"
import { PathLike } from "fs"

export type MediaType = "photo" | "audio" | "video" | "text";

export interface IMediaProvider {
    readonly mediaType: MediaType;
    sourceDirectory: PathLike;

    fetch: (pageSize?: number, skip?: number) => Array<MediaFile>
    getById: (id: string) => MediaFile
    searchByName: (name: string) => Array<MediaFile>
    searchByTimeRange: (start?: Date, end?: Date) => Array<MediaFile>
    searchByLocation: (center: { latitude: number, longitude: number }) => Array<MediaFile>
    searchByTag: (tag: string) => Array<MediaFile>
}