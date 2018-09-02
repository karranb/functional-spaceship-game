'use strict';

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * The TextMetrics object represents the measurement of a block of text with a specified style.
 *
 * ```js
 * let style = new PIXI.TextStyle({fontFamily : 'Arial', fontSize: 24, fill : 0xff1010, align : 'center'})
 * let textMetrics = PIXI.TextMetrics.measureText('Your text', style)
 * ```
 *
 * @class
 * @memberOf PIXI
 */
var TextMetrics = function () {
    /**
     * @param {string} text - the text that was measured
     * @param {PIXI.TextStyle} style - the style that was measured
     * @param {number} width - the measured width of the text
     * @param {number} height - the measured height of the text
     * @param {array} lines - an array of the lines of text broken by new lines and wrapping if specified in style
     * @param {array} lineWidths - an array of the line widths for each line matched to `lines`
     * @param {number} lineHeight - the measured line height for this style
     * @param {number} maxLineWidth - the maximum line width for all measured lines
     * @param {Object} fontProperties - the font properties object from TextMetrics.measureFont
     */
    function TextMetrics(text, style, width, height, lines, lineWidths, lineHeight, maxLineWidth, fontProperties) {
        _classCallCheck(this, TextMetrics);

        this.text = text;
        this.style = style;
        this.width = width;
        this.height = height;
        this.lines = lines;
        this.lineWidths = lineWidths;
        this.lineHeight = lineHeight;
        this.maxLineWidth = maxLineWidth;
        this.fontProperties = fontProperties;
    }

    /**
     * Measures the supplied string of text and returns a Rectangle.
     *
     * @param {string} text - the text to measure.
     * @param {PIXI.TextStyle} style - the text style to use for measuring
     * @param {boolean} [wordWrap] - optional override for if word-wrap should be applied to the text.
     * @param {HTMLCanvasElement} [canvas] - optional specification of the canvas to use for measuring.
     * @return {PIXI.TextMetrics} measured width and height of the text.
     */


    TextMetrics.measureText = function measureText(text, style, wordWrap) {
        var canvas = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : TextMetrics._canvas;

        wordWrap = wordWrap || style.wordWrap;
        var font = style.toFontString();
        var fontProperties = TextMetrics.measureFont(font);
        var context = canvas.getContext('2d');

        context.font = font;

        var outputText = wordWrap ? TextMetrics.wordWrap(text, style, canvas) : text;
        var lines = outputText.split(/(?:\r\n|\r|\n)/);
        var lineWidths = new Array(lines.length);
        var maxLineWidth = 0;

        for (var i = 0; i < lines.length; i++) {
            var lineWidth = context.measureText(lines[i]).width + (lines[i].length - 1) * style.letterSpacing;

            lineWidths[i] = lineWidth;
            maxLineWidth = Math.max(maxLineWidth, lineWidth);
        }
        var width = maxLineWidth + style.strokeThickness;

        if (style.dropShadow) {
            width += style.dropShadowDistance;
        }

        var lineHeight = style.lineHeight || fontProperties.fontSize + style.strokeThickness;
        var height = Math.max(lineHeight, fontProperties.fontSize + style.strokeThickness) + (lines.length - 1) * (lineHeight + style.leading);

        if (style.dropShadow) {
            height += style.dropShadowDistance;
        }

        return new TextMetrics(text, style, width, height, lines, lineWidths, lineHeight + style.leading, maxLineWidth, fontProperties);
    };

    /**
     * Applies newlines to a string to have it optimally fit into the horizontal
     * bounds set by the Text object's wordWrapWidth property.
     *
     * @private
     * @param {string} text - String to apply word wrapping to
     * @param {PIXI.TextStyle} style - the style to use when wrapping
     * @param {HTMLCanvasElement} [canvas] - optional specification of the canvas to use for measuring.
     * @return {string} New string with new lines applied where required
     */


    TextMetrics.wordWrap = function wordWrap(text, style) {
        var canvas = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : TextMetrics._canvas;

        var context = canvas.getContext('2d');

        var line = '';
        var width = 0;
        var lines = '';
        var cache = {};
        var ls = style.letterSpacing;

        // ideally there is letterSpacing after every char except the last one
        // t_h_i_s_' '_i_s_' '_a_n_' '_e_x_a_m_p_l_e_' '_!
        // so for convenience the above needs to be compared to width + 1 extra space
        // t_h_i_s_' '_i_s_' '_a_n_' '_e_x_a_m_p_l_e_' '_!_
        // ________________________________________________
        // And then the final space is simply no appended to each line
        var wordWrapWidth = style.wordWrapWidth + style.letterSpacing;

        // get the width of a space and add it to cache
        var spaceWidth = TextMetrics.getFromCache(' ', ls, cache, context);

        // break text into words
        var words = text.split(' ');

        for (var i = 0; i < words.length; i++) {
            var word = words[i];

            // get word width from cache if possible
            var wordWidth = TextMetrics.getFromCache(word, ls, cache, context);

            // word is longer than desired bounds
            if (wordWidth > wordWrapWidth) {
                // break large word over multiple lines
                if (style.breakWords) {
                    // add a space to the start of the word unless its at the beginning of the line
                    var tmpWord = line.length > 0 ? ' ' + word : word;

                    // break word into characters
                    var characters = tmpWord.split('');

                    // loop the characters
                    for (var j = 0; j < characters.length; j++) {
                        var character = characters[j];
                        var characterWidth = TextMetrics.getFromCache(character, ls, cache, context);

                        if (characterWidth + width > wordWrapWidth) {
                            lines += TextMetrics.addLine(line);
                            line = '';
                            width = 0;
                        }

                        line += character;
                        width += characterWidth;
                    }
                }

                // run word out of the bounds
                else {
                        // if there are words in this line already
                        // finish that line and start a new one
                        if (line.length > 0) {
                            lines += TextMetrics.addLine(line);
                            line = '';
                            width = 0;
                        }

                        // give it its own line
                        lines += TextMetrics.addLine(word);
                        line = '';
                        width = 0;
                    }
            }

            // word could fit
            else {
                    // word won't fit, start a new line
                    if (wordWidth + width > wordWrapWidth) {
                        lines += TextMetrics.addLine(line);
                        line = '';
                        width = 0;
                    }

                    // add the word to the current line
                    if (line.length > 0) {
                        // add a space if it is not the beginning
                        line += ' ' + word;
                    } else {
                        // add without a space if it is the beginning
                        line += word;
                    }

                    width += wordWidth + spaceWidth;
                }
        }

        lines += TextMetrics.addLine(line, false);

        return lines;
    };

    /**
     *  Convienience function for logging each line added
     *  during the wordWrap method
     *
     * @param  {string}   line    - The line of text to add
     * @param  {boolean}  newLine - Add new line character to end
     * @return {string}   A formatted line
     */


    TextMetrics.addLine = function addLine(line) {
        var newLine = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

        line = newLine ? line + '\n' : line;

        return line;
    };

    /**
     * Gets & sets the widths of calculated characters in a cache object
     *
     * @param  {string}                    key            The key
     * @param  {number}                    letterSpacing  The letter spacing
     * @param  {object}                    cache          The cache
     * @param  {CanvasRenderingContext2D}  context        The canvas context
     * @return {number}                    The from cache.
     */


    TextMetrics.getFromCache = function getFromCache(key, letterSpacing, cache, context) {
        var width = cache[key];

        if (width === undefined) {
            var spacing = key.length * letterSpacing;

            width = context.measureText(key).width + spacing;
            cache[key] = width;
        }

        return width;
    };

    /**
     * Calculates the ascent, descent and fontSize of a given font-style
     *
     * @static
     * @param {string} font - String representing the style of the font
     * @return {PIXI.TextMetrics~FontMetrics} Font properties object
     */


    TextMetrics.measureFont = function measureFont(font) {
        // as this method is used for preparing assets, don't recalculate things if we don't need to
        if (TextMetrics._fonts[font]) {
            return TextMetrics._fonts[font];
        }

        var properties = {};

        var canvas = TextMetrics._canvas;
        var context = TextMetrics._context;

        context.font = font;

        var width = Math.ceil(context.measureText('|MÉq').width);
        var baseline = Math.ceil(context.measureText('M').width);
        var height = 2 * baseline;

        baseline = baseline * 1.4 | 0;

        canvas.width = width;
        canvas.height = height;

        context.fillStyle = '#f00';
        context.fillRect(0, 0, width, height);

        context.font = font;

        context.textBaseline = 'alphabetic';
        context.fillStyle = '#000';
        context.fillText('|MÉq', 0, baseline);

        var imagedata = context.getImageData(0, 0, width, height).data;
        var pixels = imagedata.length;
        var line = width * 4;

        var i = 0;
        var idx = 0;
        var stop = false;

        // ascent. scan from top to bottom until we find a non red pixel
        for (i = 0; i < baseline; ++i) {
            for (var j = 0; j < line; j += 4) {
                if (imagedata[idx + j] !== 255) {
                    stop = true;
                    break;
                }
            }
            if (!stop) {
                idx += line;
            } else {
                break;
            }
        }

        properties.ascent = baseline - i;

        idx = pixels - line;
        stop = false;

        // descent. scan from bottom to top until we find a non red pixel
        for (i = height; i > baseline; --i) {
            for (var _j = 0; _j < line; _j += 4) {
                if (imagedata[idx + _j] !== 255) {
                    stop = true;
                    break;
                }
            }

            if (!stop) {
                idx -= line;
            } else {
                break;
            }
        }

        properties.descent = i - baseline;
        properties.fontSize = properties.ascent + properties.descent;

        TextMetrics._fonts[font] = properties;

        return properties;
    };

    return TextMetrics;
}();

/**
 * Internal return object for {@link PIXI.TextMetrics.measureFont `TextMetrics.measureFont`}.
 * @class FontMetrics
 * @memberof PIXI.TextMetrics~
 * @property {number} ascent - The ascent distance
 * @property {number} descent - The descent distance
 * @property {number} fontSize - Font size from ascent to descent
 */

exports.default = TextMetrics;
var canvas = document.createElement('canvas');

canvas.width = canvas.height = 10;

/**
 * Cached canvas element for measuring text
 * @memberof PIXI.TextMetrics
 * @type {HTMLCanvasElement}
 * @private
 */
TextMetrics._canvas = canvas;

/**
 * Cache for context to use.
 * @memberof PIXI.TextMetrics
 * @type {CanvasRenderingContext2D}
 * @private
 */
TextMetrics._context = canvas.getContext('2d');

/**
 * Cache of PIXI.TextMetrics~FontMetrics objects.
 * @memberof PIXI.TextMetrics
 * @type {Object}
 * @private
 */
TextMetrics._fonts = {};
//# sourceMappingURL=TextMetrics.js.map