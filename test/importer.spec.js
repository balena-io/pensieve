/* eslint-env mocha */
import * as fs from 'fs'
import { expect } from 'chai'
import * as importer from '../src/services/importer'

const sourceFile = fs.readFileSync('./test/resources/pokedex.md', 'utf8')
const sourceFile2 = fs.readFileSync('./test/resources/types.md', 'utf8')

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

const schema2 = [
  {
    name: 'Title',
    type: 'Short Text'
  },
  {
    name: 'Description',
    type: 'Text'
  },
  {
    name: 'Boolean',
    type: 'Boolean'
  },
  {
    name: 'Case Insensitive Text',
    type: 'Case Insensitive Text'
  },
  {
    name: 'Date Time',
    type: 'Date Time'
  },
  {
    name: 'Date',
    type: 'Date'
  },
  {
    name: 'Integer',
    type: 'Integer'
  },
  {
    name: 'Real',
    type: 'Real'
  },
  {
    name: 'Real',
    type: 'Real'
  },
  {
    name: 'Short Text',
    type: 'Short Text'
  },
  {
    name: 'Text',
    type: 'Text'
  },
  {
    name: 'Time',
    type: 'Time'
  },
  {
    name: 'Enum',
    type: 'Enum'
  },
  {
    name: 'Semver Range',
    type: 'Semver Range'
  },
  {
    name: 'Semver',
    type: 'Semver'
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
        $PENSIEVE_IMPORTED_COPY_FIELD_KEY1: 'One of my favourites'
      })
    })

    it('should correctly import "Boolean" types', () => {
      expect(importer.convert(schema2, sourceFile2)[0]).to.include({
        Boolean: true
      })
    })

    it('should correctly import "Case Insensitive Text" types', () => {
      expect(importer.convert(schema2, sourceFile2)[0]).to.include({
        'Case Insensitive Text': 'Lorem ipsum dolor sit amet'
      })
    })

    it('should correctly import "Date Time" types', () => {
      expect(importer.convert(schema2, sourceFile2)[0]).to.include({
        'Date Time': '12345'
      })
    })

    it('should correctly import "Date" types', () => {
      expect(importer.convert(schema2, sourceFile2)[0]).to.include({
        Date: '12345'
      })
    })

    it('should correctly import "Integer" types', () => {
      expect(importer.convert(schema2, sourceFile2)[0]).to.include({
        Integer: 1
      })
    })

    it('should correctly import "Real" types', () => {
      expect(importer.convert(schema2, sourceFile2)[0]).to.include({
        Real: 2.5
      })
    })

    it('should correctly import "Short Text" types', () => {
      expect(importer.convert(schema2, sourceFile2)[0]).to.include({
        'Short Text': 'Lorem ipsum dolor sit amet'
      })
    })

    it('should correctly import "Text" types', () => {
      expect(importer.convert(schema2, sourceFile2)[0]).to.include({
        Text: 'Lorem ipsum dolor sit amet'
      })
    })

    it('should correctly import "Time" types', () => {
      expect(importer.convert(schema2, sourceFile2)[0]).to.include({
        Time: '12345'
      })
    })

    it('should correctly import "Enum" types', () => {
      expect(importer.convert(schema2, sourceFile2)[0]).to.include({
        Enum: 'Lorem ipsum dolor sit amet'
      })
    })

    it('should correctly import "Semver Range" types', () => {
      expect(importer.convert(schema2, sourceFile2)[0]).to.include({
        'Semver Range': '> 1.0.0'
      })
    })

    it('should correctly import "Semver" types', () => {
      expect(importer.convert(schema2, sourceFile2)[0]).to.include({
        Semver: '2.0.0'
      })
    })
  })
})
