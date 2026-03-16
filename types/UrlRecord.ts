export type UrlRecord = {
  original: string;
  new: string;
  created_at: string;
  visits: number;
  last_visited: string | null;
};

export type QrRecord = UrlRecord & {
  qr_code: string;
};
