declare module 'jsmediatags-web' {
  interface Tags {
    title?: string;
    artist?: string;
    album?: string;
    year?: string;
    comment?: string;
    track?: string;
    genre?: string;
    picture?: {
      format: string;
      data: number[];
    };
  }

  interface TagType {
    tags: Tags;
  }

  interface ErrorType {
    type: string;
    info: string;
    message?: string;
  }

  interface Callbacks {
    onSuccess: (tag: TagType) => void;
    onError?: (error: ErrorType) => void;
  }

  function read(file: File | Blob | string, callbacks: Callbacks): void;

  export default {
    read
  };
}