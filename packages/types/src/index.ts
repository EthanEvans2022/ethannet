import { MIMEType } from "util";

export interface HelloResponse {
  message: string;
  timestamp: string;
}

export interface MediaFileMetadata {
  id: string;
  name: string;
  size: number;
  creationTimestamp: Date
  lastUpdatedTimestamp: Date
  mimeType: MIMEType
  location?: { latitude: number, longitude: number }
}

export interface MediaFile extends MediaFileMetadata {
  content: Blob
}
