import { Request } from "express";
import fs from "fs";    
import logger from "../loggers/winston.logger";

export const removeLocalFile = (localPath : string) => {
  fs.unlink(localPath, (err) => {
    if (err) logger.error("Error while removing local files: ", err);
    else {
      logger.info("Removed local: ", localPath);
    }
  });
};

export const removeFiles = (req : Request) => {
  try {
    const multerFile = req.file;
    const multerFiles = req.files;

    if (multerFile) { // single file
      removeLocalFile(multerFile.path);
    }

    if (multerFiles) { // multiple files
      const filesValueArray = Object.values(multerFiles);
      filesValueArray.map((fileFields) => {
        fileFields.map((fileObject : Express.Multer.File) => {
          removeLocalFile(fileObject.path);
        });
      });
    }
  } catch (error) {
    logger.error("Error while removing image files: ", error);
  }
};