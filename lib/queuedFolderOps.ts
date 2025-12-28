export type FolderOpPayloadMap = {
    FOLDER_CREATE: {
      id: string;
      name: string;
    };
  
    FOLDER_UPDATE: {
      id: string;
      name?: string;
    };
  
    FOLDER_DELETE: {
      id: string;
    };
    FOLDER_ADD_HABIT: {
      id: string;
      habitId: string;
    };
    FOLDER_REMOVE_HABIT: {
      id: string;
      habitId: string;
    };
  };
  
  export type FolderQueuedOp = {
    [K in keyof FolderOpPayloadMap]: {
      type: K;
      payload: FolderOpPayloadMap[K];
      timestamp: string;
    }
  }[keyof FolderOpPayloadMap];
  