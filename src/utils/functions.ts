export const getRandomColor = () => {
    const letters = '0123456789ABCDEF'.split('');
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

export const generateColors = (colorRange: number) => {
    const generatedColors = [];
    for (let i = 0; i < colorRange; i++) {
        generatedColors[i] = getRandomColor();
    }
    return generatedColors
};

export const sleep = (ms: any) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

export const withTimeout = (millis: any, promise: any) => {
    const timeout = new Promise((_: any, reject: any) =>
        setTimeout(() => {
            console.log(`Timed out after ${millis} ms.`)
            reject(`Timed out after ${millis} ms.`)
        }, millis)
    );
    return Promise.race([
        promise,
        timeout
    ]);
};