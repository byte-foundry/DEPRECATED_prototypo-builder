import deepFreeze from 'deep-freeze';

import {
  getUpdater,
  buildArgs,
  getUpdaters,
  getCalculatedParams,
  getSolvingOrder,
  getCalculatedGlyph,
} from '../../src/_utils/parametric';

describe('containers/_utils', () => {
  describe('getUpdater', () => {
    it('should return a formula with isInvalid === true when the formula can\'t be parsed', (done) => {
      const strFormula = '$width * ';
      const expected = {
        formula: strFormula,
        isInvalid: true,
      };

      expect(getUpdater(strFormula)).toEqual(expected);

      done();
    });

    it('should parse a vail formula and extract params and refs', (done) => {
      const strFormula = '( $width * $height ) + ( glyph.oncurve_0.x - glyph.oncurve_1.x ) * 2';

      const result = getUpdater(strFormula);

      expect(result.isInvalid).toEqual(false);
      expect(result.fn).toBeInstanceOf(Function);
      expect(result.params).toEqual(['$width', '$height']);
      expect(result.refs).toEqual(['oncurve_0.x', 'oncurve_1.x']);

      done();
    });
  });

  describe('buildArgs', () => {
    it('should build an array of arguments to be passed to updater.apply', (done) => {
      const params = {
        $width: 12,
        $height: 34,
        $expand: 56,
      };

      deepFreeze(params);

      expect(buildArgs(null, params, []))
        .toEqual([null]);

      expect(buildArgs(null, params, ['$expand', '$width']))
        .toEqual([ null, 56, 12 ]);

      done();
    });

    it('should throw when trying to use a non-existant param', (done) => {
      const params = {};

      deepFreeze(params);

      expect(() => {
        buildArgs(null, params, ['$zip'])
      }).toThrow(Error);

      done();
    });
  });

  describe('getUpdaters', () => {
    it('should parse all formulas', (done) => {
      const formulas = {
        'node_0.x': '$width * 10',
        'node_1.y': 'glyph.node_0.x + $height',
      };

      deepFreeze(formulas);
      const updaters = getUpdaters([], formulas);

      expect(updaters['node_0.x'].fn).toBeInstanceOf(Function);
      expect(updaters['node_1.y'].fn).toBeInstanceOf(Function);

      done();
    });
  });

  describe('getCalculatedParams', () => {
    it('should replace params with calculatedParams', (done) => {
      const stateBefore = {
        width: { value: 12 },
        expand: { formula: '34' },
        distrib: { formula: '1 *' },
      };
      const parentParams = {};

      deepFreeze(parentParams);
      deepFreeze(stateBefore);

      const calculatedParams =
        getCalculatedParams(stateBefore, parentParams, 'node-0');

      expect(calculatedParams.width).toEqual(12);
      expect(calculatedParams.expand).toEqual(34);
      expect(calculatedParams.distrib).toBeInstanceOf(Error);

      done();
    });
  });

  describe('getSolvingOrder', () => {
    it('should return the solving order for this glyph', (done) => {
      const glyphUpdaters = {
        'node_0.x': { refs: ['node_1.x'] },
        'node_0.y': { refs: [] },
        'node_1.x': { refs: [] },
        'node_1.y': { refs: ['node_0.y'] },
      };
      const expected = [
        'node_1.x',
        'node_0.x',
        'node_0.y',
        'node_1.y',
      ];

      expect(getSolvingOrder(glyphUpdaters)).toEqual(expected);

      done();
    });
  });

  describe('getCalculatedGlyph', () => {
    it('should return a subset of the graph that includes all children of the glyph', (done) => {
      // ... and all properties of these nodes should be 'calculated'

      const stateBefore = {
        nodes: {
          'root': {
            id: 'root',
            type: 'root',
            childIds: ['font_initial'],
          },
          'font_initial': {
            id: 'font_initial',
            type: 'font',
            childIds: ['glyph_initial'],
            params: {},
          },
          'glyph_initial': {
            id: 'glyph_initial',
            type: 'glyph',
            childIds: ['contour_initial'],
            params: {},
          },
          'contour_initial': {
            id: 'contour_initial',
            type: 'contour',
            childIds: ['node_0', 'node_1'],
          },
          'node_0': {
            id: 'node_0',
            type: 'path',
            x: 12,
            y: 34,
            isClosed: true,
            childIds: [],
          },
          'node_1': {
            id: 'node_1',
            type: 'path',
            expand: 56,
            childIds: ['node_2', 'node_3'],
          },
          'node_2': {
            id: 'node_2',
            type: 'path',
            childIds: [],
          },
          'node_3': {
            id: 'node_3',
            type: 'path',
            childIds: [],
          },
        },
        formulas: {
          'glyph_initial': {
            'node_0.x': 'glyph.node_1.x',
            'node_0.y': 'glyph.node_1.x * 2',
            'node_1.x': '$width',
          },
        },
      };

      const expected = {
        'contour_initial': {
          id: 'contour_initial',
          type: 'contour',
          childIds: ['node_0', 'node_1'],
        },
        'node_0': {
          id: 'node_0',
          type: 'path',
          x: 78,
          y: 78 * 2,
          isClosed: true,
          childIds: [],
        },
        'node_1': {
          id: 'node_1',
          type: 'path',
          x: 78,
          expand: 56,
          childIds: ['node_2', 'node_3'],
        },
        'node_2': {
          id: 'node_2',
          type: 'path',
          childIds: [],
        },
        'node_3': {
          id: 'node_3',
          type: 'path',
          childIds: [],
        },
      };

      deepFreeze(stateBefore.nodes);

      expect(getCalculatedGlyph(stateBefore, { '$width': 78 }, 'glyph_initial'))
        .toEqual(expected);

      done();
    });
  });
});
