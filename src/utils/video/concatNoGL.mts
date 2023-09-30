import ffmpeg from "fluent-ffmpeg";
import fs from "fs";

interface IConcatParams {
    output: string;
    videos: string[];
    transitions: any;
}

const concat = async ({ output, videos }: IConcatParams): Promise<void> => {
    if(!output || !Array.isArray(videos)) {
        throw new Error("An output file and videos must be provided");
    }

    if(!videos.every(video => fs.existsSync(video))) {
        throw new Error("All videos must exist");
    }

    const ffmpegCommand = ffmpeg();
 
    videos.forEach((video) =>
        ffmpegCommand.addInput(video)
    );

    return new Promise<void>((resolve, reject) => {
        ffmpegCommand
            .on('error', reject)
            .on('end', resolve)
            .mergeToFile(output);
    });
};
  
export default concat;