import { Component, OnInit } from "@angular/core";
import { ILaunchResultInterface } from "./shared/interfaces/launch-result.interface";
import { IPosition } from "./shared/interfaces/position.interface";

import Chart from "chart.js/auto";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
    g = 10; // aceleração da gravidade em m/s^2
    v0 = 10; // velocidade inicial em m/s ===== FORÇA Q O CARA VAI ARREMESSAR
    theta = 45; // ângulo de lançamento em graus

    xInicial = 0;
    yInicial = 25;

    data: IPosition[] = [];

    objectCollided = false;
    collisionBody = {
        posX: 245.51,
        posY: 46.28,
        width: 1,
        height: 1,
    };

    ngOnInit(): void {
        const v0Input = prompt("Digite a força do arremesso");
        if (v0Input) this.v0 = parseInt(v0Input);

        const theta = prompt("Digite o ângulo do arremesso");
        if (theta) this.theta = parseInt(theta);

        this.setData();

        this.setChart();
    }

    setData() {
        this.data = [];
        this.objectCollided = false;
        const vWindX = 0; // velocidade do vento na horizontal em m/s
        const tTotal = this.getLaunchResult(vWindX).tTotal; // tempo total de voo

        // for (let t = 0; t <= tTotal; t += 0.1) {
        for (let t = 0; t <= tTotal; t += tTotal * 0.01) {
            if (!this.objectCollided) {
                const { x, y } = this.setPosition(vWindX, t); // posição do objeto em cada instante de tempo
                this.data.push({ x, y });
            }
        }
    }

    setChart() {
        const chart = new Chart("myChart", {
            type: "scatter",
            data: {
                datasets: [
                    {
                        label: "corpo de colisão",
                        data: [
                            {
                                x: this.collisionBody.posX,
                                y: this.collisionBody.posY,
                            },
                            {
                                x: this.collisionBody.posX + 10,
                                y: this.collisionBody.posY + 10,
                            },
                        ],
                        backgroundColor: "red",
                        borderColor: "red",
                        borderWidth: 1,
                        pointRadius: 3,
                        showLine: false,
                        fill: false
                    },
                    {
                        label: "Trajetória do objeto",
                        data: this.data,
                        backgroundColor: "steelblue",
                        borderColor: "steelblue",
                        borderWidth: 1,
                        pointRadius: 3,
                        showLine: true,
                        fill: false,
                    }
                ],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const { x, y } = context.parsed;
                                return `Alcance horizontal: ${x.toFixed(
                                    2
                                )} m, Altura: ${y.toFixed(2)} m`;
                            },
                        },
                    },
                },
                scales: {
                    x: {
                        type: "linear",
                        position: "bottom",
                        title: {
                            display: true,
                            text: "Alcance horizontal (m)",
                        },
                        ticks: {
                            stepSize: 5,
                        },
                    },
                    y: {
                        type: "linear",
                        position: "left",
                        title: {
                            display: true,
                            text: "Altura (m)",
                        },
                        ticks: {
                            stepSize: 5,
                        },
                    },
                },
            },
        });
    }

    getLaunchResult(vWindX: number): ILaunchResultInterface {
        const v0x = this.v0 * Math.cos(this.theta * Math.PI / 180); // componente horizontal da velocidade inicial
        const v0y = this.v0 * Math.sin(this.theta * Math.PI / 180); // componente vertical da velocidade inicial

        // Tempo de voo
        const tTotal =
            (v0y + Math.sqrt(v0y ** 2 + 2 * this.g * this.yInicial)) / this.g; // tempo para atingir a altura máxima e cair de volta ao solo
        const tSubida = v0y / this.g; // tempo para atingir a altura máxima
        const tDescida =
            (v0y + Math.sqrt(v0y ** 2 + 2 * this.g * 0)) / this.g - tSubida; // tempo para cair de volta ao solo
        const maxHeight = v0y ** 2 / (2 * this.g) + this.yInicial; // altura máxima alcançada
        const reach = (v0x + vWindX) * tTotal + this.xInicial; // alcance horizontal

        console.log(maxHeight);

        return {
            tTotal,
            reach,
            maxHeight,
        };
    }

    setPosition(vWindX: number, t: number): IPosition {
        const v0x = this.v0 * Math.cos(this.theta * Math.PI / 180); // componente horizontal da velocidade inicial
        const v0y = this.v0 * Math.sin(this.theta * Math.PI / 180); // componente vertical da velocidade inicial

        let x = v0x * t + vWindX * t + this.xInicial; // posição horizontal
        let y = v0y * t - 0.5 * this.g * t ** 2 + this.yInicial; // posição vertical

        const collisionBodyXOffset = this.collisionBody.width / 2;
        const collisionBodyYOffset = this.collisionBody.height / 2;

        if (
            x >= this.collisionBody.posX - collisionBodyXOffset &&
            x <= this.collisionBody.posX + collisionBodyXOffset &&
            y >= this.collisionBody.posY - collisionBodyYOffset &&
            y <= this.collisionBody.posY + collisionBodyYOffset
        ) {
            x = this.collisionBody.posX;
            y = this.collisionBody.posY;

            this.objectCollided = true;
        }

        return {
            x,
            y,
        };
    }
}
