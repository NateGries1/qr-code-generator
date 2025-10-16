import { UrlRecord } from "./UrlRecord";
export type QrRecord = UrlRecord & {
  qr_code: string;
};
