/* global document */

export const getById = id => document.getElementById(id)

export const degreesToRadians = degrees => degrees * (Math.PI / 180)

export const randomBetween = (min, max) => Math.random() * (max - min) + min
