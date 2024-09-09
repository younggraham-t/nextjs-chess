export default class Coord {
	public fileIndex: number;
	public rankIndex: number;

	constructor (fileIndex: number, rankIndex: number) {
		this.fileIndex = fileIndex;
		this.rankIndex = rankIndex;
	}

	IsLightSquare () {
		return (this.fileIndex + this.rankIndex) % 2 != 0;
	}

}
