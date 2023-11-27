/**
 * @file LEDController.js
 * @description This file contains the LEDController class, which manages the state and behavior of LED elements.
 * @version 1.0.0
 * @author José Eduardo Hernández Rodríguez
 */

/**
 * Class representing the LED controller.
 */
class LEDController {
    /**
     * Creates an instance of LEDController.
     */
    constructor() {
        /**
         * @property {number[]} ledState - Represents the state of all LEDs, initialized to all off (0).
         */
        this.ledState = Array.from({ length: 64 }, () => 0);
    }

    /**
     * Initializes the LEDController when the DOM content is loaded.
     * Sets up event listeners and creates LED layers.
     */
    initialize() {
        document.addEventListener('DOMContentLoaded', () => {
            const layersContainer = document.getElementById('layers');
            this.createLayers(layersContainer);
            this.addEventListenersToLEDs();

            const saveButton = document.getElementById('save_button');
            saveButton.addEventListener('click', this.saveToFile.bind(this));

            const loadButton = document.getElementById('load_button');
            loadButton.addEventListener('click', this.loadFromFile.bind(this));

            const resetButton = document.getElementById('reset_button');
            resetButton.addEventListener('click', this.resetLEDs.bind(this));

            const sendButton = document.getElementById('send_button');
            sendButton.addEventListener('click', this.sendConfig.bind(this));
        });
    }

    /**
     * Creates LED layers and appends them to the specified container.
     * @param {HTMLElement} container - The container to append layers to.
     */
    createLayers(container) {
        for (let i = 1; i <= 4; i++) {
            const layer = this.createLayerElement(i);
            container.appendChild(layer);
        }
    }

    /**
     * Creates a layer element with LEDs and returns it.
     * @param {number} layerNumber - The layer number.
     * @returns {HTMLElement} The created layer element.
     */
    createLayerElement(layerNumber) {
        const layer = document.createElement('div');
        layer.classList.add('layer');
        layer.id = `layer${layerNumber}`;

        for (let j = 1; j <= 4; j++) {
            for (let k = 1; k <= 4; k++) {
                const led = this.createLEDElement(layerNumber, (j - 1) * 4 + k);
                layer.appendChild(led);
            }
        }
        return layer;
    }

    /**
     * Creates an LED element and returns it.
     * @param {number} layerNumber - The layer number.
     * @param {number} ledNumber - The LED number.
     * @returns {HTMLElement} The created LED element.
     */
    createLEDElement(layerNumber, ledNumber) {
        const led = document.createElement('div');
        led.classList.add('led');
        led.id = `layer_${layerNumber}_led_${ledNumber}`;
        return led;
    }

    /**
     * Adds click event listeners to all LEDs.
     */
    addEventListenersToLEDs() {
        const leds = document.querySelectorAll('.led');
        leds.forEach(led => {
            led.addEventListener('click', this.handleLEDClick.bind(this));
        });
    }

    /**
     * Handles the click event on an LED.
     * @param {Event} event - The click event.
     */
    handleLEDClick(event) {
        const [, layer, , ledNumber] = event.target.id.split('_');
        console.log(`Click on LED: Layer ${layer}, LED ${ledNumber}`);

        event.target.classList.toggle('green');

        const index = (layer - 1) * 16 + parseInt(ledNumber) - 1;
        this.ledState[index] = event.target.classList.contains('green') ? 1 : 0;

        const formattedBinaryStringFinal = this.generateFormattedBinaryString();
        console.log(`Binary String: \n${formattedBinaryStringFinal}`);
    }

    /**
     * Generates and returns the formatted binary string.
     * @returns {string} The formatted binary string.
     */
    generateFormattedBinaryString() {
        const binaryString = this.ledState.map(bit => (bit ? '1' : '0')).join('');
        const formattedBinaryString = binaryString.replace(/.{4}/g, 'B$&,');
        return formattedBinaryString.replace(/.{24}/g, '$& ').trim() + ' 10,';
    }

    /**
     * Event handler for the click on the save button.
     */
    saveToFile() {
        const formattedBinaryStringFinal = this.generateFormattedBinaryString();
        const blob = new Blob([formattedBinaryStringFinal], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'led_state.txt';
        link.click();
        URL.revokeObjectURL(link.href);
    }

    /**
     * Event handler for the click on the load button.
     */
    loadFromFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'text/plain';

        input.addEventListener('change', event => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();

                reader.onload = e => {
                    const content = e.target.result;
                    this.processLoadedContent(content);
                };
                reader.readAsText(file);
            }
        });
        input.click();
    }

    /**
     * Process content from the loaded file.
     * @param {string} content - The content loaded from the file.
     */
    processLoadedContent(content) {
        const binaryArray = content.match(/[01]/g);
        console.log(binaryArray);

        const chunksOf16Bits = [];
        for (let i = 0; i < binaryArray.length; i += 16) 
            chunksOf16Bits.push(binaryArray.slice(i, i + 16).join(''));
        console.log(chunksOf16Bits);

        for (let i = 0; i < chunksOf16Bits.length - 1; i++) {
            for (let j = 0; j < 16; j++) {
                console.log('layer_' + (i + 1) + '_led_' + (j + 1) + ': ' + chunksOf16Bits[i].charAt(j));
                let led = document.getElementById('layer_' + (i + 1) + '_led_' + (j + 1));

                if (chunksOf16Bits[i].charAt(j) === '1') led.click();
            }
        }

        console.log('LED state loaded successfully.');
    }

    /**
     * Resets the state of all LEDs to off.
     */
    resetLEDs() {
        for (let layer = 1; layer <= 4; layer++) {
            for (let led = 1; led <= 16; led++) {
                let element = document.getElementById('layer_' + layer + '_led_' + led);
                if (element.classList.contains('green')) element.click();
            }
        }
    }

    /**
     * Send the configuration to http://app.smarttransit.online:3000/send-message
     */
    sendConfig() {
        const formattedBinaryStringFinal = this.generateFormattedBinaryString();
        const message = { message: formattedBinaryStringFinal };

        fetch('https://api.smarttransit.online/send-message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message)
        }).then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            } console.log('Config sent successfully');
        }).catch(error => {
            console.error('There was a problem whit the fetch operation:', error);
        });
    }
}

// Instantiate the LEDController class
const ledController = new LEDController();
ledController.initialize();