import { BoardIds, BoardShim } from 'brainflow';
import { processData } from '../dataprocessing/transforms.js';
// import { visualizeData } from '../flasher/EEGselector.js';

function sleep(ms: number) {
    return new Promise((resolve) => { setTimeout(resolve, ms); });
}

async function runExample(): Promise<void> {
    const board = new BoardShim(BoardIds.UNICORN_BOARD, {});
    board.prepareSession();
    board.startStream();
    await sleep(3000);
    board.stopStream();
    const data = board.getBoardData();
    board.releaseSession();

    console.info('Raw Data:', data);

    // Process the data
    const processedData = processData(data);
    console.info('Processed Data:', processedData);

    // Visualize the processed data
    // visualizeData(processedData);
}

runExample();