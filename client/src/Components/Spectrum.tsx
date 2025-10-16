interface SpectrumProps {
    playerName: string,
    heights: number[],
    isAlive: boolean,
}

export default function Spectrum({playerName, heights, isAlive}: SpectrumProps) {
    const maxHeight = 20;
    const cellSize = "w-2 h-3"

    return (
        <div className="flex flex-col items-center mx-2">
            <div className="text-white text-sm mb-1">{playerName}</div>
            <div className="flex gap-px bg-gray-800 p-1 rounded">
                {heights.map((height, col) => (
                    <div key={col} className="flex flex-col-reverse gap-px">
                        {Array.from({length: maxHeight}).map((_, row) => (
                            <div
                                key={row}
                                className={`${cellSize} ${
                                    row < height
                                        ? (isAlive ? 'bg-blue-400' : 'bg-red-500')
                                        : 'bg-gray-700'
                                }`}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    )
}