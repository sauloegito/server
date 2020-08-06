class Converter {
    hourToMinutes(time: string): number {
        const [hour, minutes] = time.split(":").map(Number);
        const timeInMinutes = (hour * 60) + minutes;
        return timeInMinutes;
    }

    minutesToHour(time: number): string {
        const minutes = time % 60;
        const hour = Math.floor(time / 60);

        const timeInHour = this._2digits(hour) + ":" + this._2digits(minutes);
        return timeInHour;
    }

    _2digits(amount: number): string {
        return amount.toString().padStart(2, '0');
    }
}

const converter = new Converter();

export default converter;