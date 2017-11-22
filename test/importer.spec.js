/* eslint-env mocha */
import * as fs from 'fs'
import { expect } from 'chai'
import * as importer from '../src/services/importer'

const sourceFile = fs.readFileSync('./test/resources/pokedex.md', 'utf8')
const schema = [
  {
    name: 'Name',
    type: 'Case Insensitive Text'
  },
  {
    name: 'Description',
    type: 'Case Insensitive Text'
  },
  {
    name: 'Real',
    type: 'Case Insensitive Text'
  }
]

describe('importer', () => {
  describe('convert', () => {
    it('should return an array', () => {
      expect(importer.convert(schema, sourceFile)).to.be.an('array')
    })

    it('should return an array of the correct length', () => {
      expect(importer.convert(schema, sourceFile)).to.have.lengthOf(3)
    })

    it('should return an array of objects', () => {
      expect(importer.convert(schema, sourceFile)[0]).to.be.an('object')
    })

    it('should use the first element of the schema for the title field', () => {
      expect(importer.convert(schema, sourceFile)[0]).to.include({
        Name: 'Bulbasaur'
      })
    })

    it('should use markdown headers as object keys', () => {
      expect(importer.convert(schema, sourceFile)[0]).to.have.all.keys(
        'Name',
        'Description',
        'Height'
      )
    })

    it('should populate field values correctly', () => {
      expect(importer.convert(schema, sourceFile)[0]).to.include({
        Description:
          "Bulbasaur can be seen napping in bright sunlight. There is a seed on its back.\nBy soaking up the sun's rays, the seed grows progressively larger.",
        Height: '0.7m'
      })
    })

    it('should add preliminary text copy using a special key', () => {
      expect(importer.convert(schema, sourceFile)[2]).to.include({
        'Imported copy 1': 'One of my favourites'
      })
    })
  })
})
