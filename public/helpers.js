function splitArrIntoChunks(originalArr, containerArr, chunkSize) {
  while (originalArr.length > 0) {
    containerArr.push(originalArr.splice(0, chunkSize));
  }
}