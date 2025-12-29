import {expect, it, describe} from '@jest/globals';

import areSimilarCoordinates from "./areSimilarCoordinates";

describe("areSimilarCoordinates", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return true if coordinates are close enough", () => {
        const coordinate1 = { x: 40.75660, y: -73.99320 };
        const coordinate2 = { x: 40.75662, y: -73.99315 };
    
        const result = areSimilarCoordinates(coordinate1, coordinate2);

        expect(result).toBe(true);
    });

    it("should return true if coordinates are the same", () => {
        const coordinate1 = { x: 40.7128, y: 74.0060 };
        const coordinate2 = { x: 40.7128, y: 74.0060 };
    
        const result = areSimilarCoordinates(coordinate1, coordinate2);
    
        expect(result).toBe(true);
    });

    it("should return false if coordinates are different", () => {
        const coordinate1 = { x: 40.7128, y: 74.0060 };
        const coordinate2 = { x: 37.7749, y: 122.4194 };
    
        const result = areSimilarCoordinates(coordinate1, coordinate2);
    
        expect(result).toBe(false);
    });

    it("should return false if latitudes are different", () => {
        const coordinate1 = { x: 40.7128, y: 74.0060 };
        const coordinate2 = { x: 37.7749, y: 74.0060 };
    
        const result = areSimilarCoordinates(coordinate1, coordinate2);
    
        expect(result).toBe(false);
    });

    it("should return false if longitudes are different", () => {
        const coordinate1 = { x: 40.7128, y: 74.0060 };
        const coordinate2 = { x: 40.7128, y: 122.4194 };
    
        const result = areSimilarCoordinates(coordinate1, coordinate2);
    
        expect(result).toBe(false);
    });

    it("should return false if one coordinate is undefined", () => {
        const coordinate1 = { x: 40.7128, y: 74.0060 };
        const coordinate2 = undefined;
    
        const result = areSimilarCoordinates(coordinate1, coordinate2);
    
        expect(result).toBe(false);
    });

    it("should return false if both coordinates are undefined", () => {
        const coordinate1 = undefined;
        const coordinate2 = undefined;
    
        const result = areSimilarCoordinates(coordinate1, coordinate2);
    
        expect(result).toBe(false);
    });

});