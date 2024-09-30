export default function Coordinates(props: {isWhitePlayer: boolean}) {
    const isWhitePlayer = props.isWhitePlayer;
    const lightCoordClass = "fill-stone-900 font-semibold"
    const darkCoordClass = "fill-stone-200 font-semibold"

    const letterY = "99";
    const letters = ["a","b","c","d","e","f","g","h"];
    const letterXStart = isWhitePlayer ? 10 : 97.5;
    const letterXOffset = isWhitePlayer ? 12.5 : -12.5;


    const initialLetterClass = isWhitePlayer ? darkCoordClass : lightCoordClass;
    const letterTexts = letters.map((letter, i)=>{
        let className = initialLetterClass;
        const x = letterXStart + (i * letterXOffset);
        
        if (isWhitePlayer) {
            className = i % 2 == 0 ? darkCoordClass : lightCoordClass
        }
        else {
            className = i % 2 == 0 ? lightCoordClass : darkCoordClass
        }
        return (
            <text key={x} className={className} x={x} y={letterY} fontSize="2.8">{letter}</text>
        )
        
    })

    const numberX = "0.75";
    const numbers = ["1","2","3","4","5","6","7","8"];
    const numberYStart = isWhitePlayer ? 90.75 : 3.5;
    const numberYOffset = isWhitePlayer ? -12.5 : 12.5;

    const initialNumberClass = isWhitePlayer ? darkCoordClass : lightCoordClass;
    const numberTexts = numbers.map((number,i) => {
        let className = initialNumberClass;
        const y = numberYStart + (i * numberYOffset);
        if (isWhitePlayer) {
            className = i % 2 == 0 ? darkCoordClass : lightCoordClass
        }
        else {
            className = i % 2 == 0 ? lightCoordClass : darkCoordClass
        }

        return (
            <text key={y} className={className} x={numberX} y={y} fontSize="2.8">{number}</text>
        )
    })


    return (
        <svg className={`absolute top-0 left-0 select-none`} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            {numberTexts}
            {letterTexts}
        </svg>
    )
}
