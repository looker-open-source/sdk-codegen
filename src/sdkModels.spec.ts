import { CriteriaToSet, IMethod, ITagList, SearchCriterion, SearchCriterionTerm, SetToCriteria } from './sdkModels'
import { TestConfig } from '../typescript/looker/rtl/nodeSettings.spec'
import { specFromFile } from './sdkGenerator'

const config = TestConfig()
export const apiTestModel = specFromFile(
  `${config.testPath}openApiRef.json`,
  `${config.testPath}swaggerRef.json`
)

describe('sdkModels', () => {

  describe('request type determination', () => {

    it('search_looks', () => {
      const method = apiTestModel.methods['search_looks']
      const actual = apiTestModel.getRequestType(method)
      expect(actual).toBeDefined()
      if (actual) {
        expect(actual.properties['title']).toBeDefined()
      }
    })

    it('search_spaces', () => {
      const method = apiTestModel.methods['search_spaces']
      const actual = apiTestModel.getRequestType(method)
      expect(actual).toBeDefined()
      if (actual) {
        expect(actual.properties['fields']).toBeDefined()
      }
    })

    // TODO create a mock spec that has a recursive type, since this no longer does
    // it ('detects recursive types', () => {
    //   let type = apiTestModel.types['LookmlModelExploreField']
    //   let actual = type.isRecursive()
    //   expect(actual).toEqual(true)
    //   type = apiTestModel.types['CredentialsApi3']
    //   actual = type.isRecursive()
    //   expect(actual).toEqual(false)
    // })
  })

  describe('response modes', () => {

    it('binary only', () => {
      const method = apiTestModel.methods['render_task_results']
      expect(method.responseIsBinary()).toEqual(true)
      expect(method.responseIsString()).toEqual(false)
      expect(method.responseIsBoth()).toEqual(false)
    })

    it('string only', () => {
      const method = apiTestModel.methods['add_group_user']
      expect(method.responseIsBinary()).toEqual(false)
      expect(method.responseIsString()).toEqual(true)
      expect(method.responseIsBoth()).toEqual(false)
    })

    it('both modes', () => {
      const method = apiTestModel.methods['run_look']
      expect(method.responseIsBinary()).toEqual(true)
      expect(method.responseIsString()).toEqual(true)
      expect(method.responseIsBoth()).toEqual(true)
    })

  })

  describe('required properties', () => {

    it('CreateQueryTask', () => {
      const type = apiTestModel.types['CreateQueryTask']
      const actual = apiTestModel.getWriteableType(type)
      expect(actual).toBeDefined()
      expect(type.properties['query_id'].required).toEqual(true)
      expect(type.properties['result_format'].required).toEqual(true)
      expect(type.properties['source'].required).toEqual(false)
    })

    it('WriteCreateQueryTask', () => {
      const type = apiTestModel.getWriteableType(apiTestModel.types['CreateQueryTask'])
      expect(type).toBeDefined()
      expect(type!.properties['query_id'].required).toEqual(true)
      expect(type!.properties['result_format'].required).toEqual(true)
      expect(type!.properties['source'].required).toEqual(false)
    })
  })

  describe('writeable logic', () => {

    it('CredentialsApi3', () => {
      const type = apiTestModel.types['CredentialsApi3']
      const writeable = type.writeable
      expect(type.readOnly).toEqual(true)
      expect(writeable.length).toEqual(0)
    })

    describe('DashboardElement', () => {
      it('writeable', () => {
        const type = apiTestModel.types['DashboardElement']
        const writeable = type.writeable
        expect(type.readOnly).toEqual(false)
        expect(writeable.length).toEqual(17)
      })

      it('writeableType', () => {
        const type = apiTestModel.types['DashboardElement']
        const actual = apiTestModel.getWriteableType(type)
        expect(actual).toBeDefined()
        if (actual) {
          expect(actual.properties['body_text']).toBeDefined()
          expect(actual.properties['body_text_as_html']).not.toBeDefined()
          expect(actual.properties['dashboard_id']).toBeDefined()
          expect(actual.properties['edit_uri']).not.toBeDefined()
          expect(actual.properties['look_id']).toBeDefined()
        }
      })

    })

  })

  const allMethods = (tags: ITagList) : Array<IMethod> => {
    let result: Array<IMethod> = []
    Object.entries(tags).forEach(([key, methods]) => {
      Object.entries(methods).forEach(([name, method]) => {
        result.push(method)
      })
    })
    return result
  }

  describe('searching', () => {

    const modelAndTypeNames = new Set([SearchCriterion.method, SearchCriterion.type, SearchCriterion.name])
    const modelNames = new Set([SearchCriterion.method, SearchCriterion.name])
    const titleOnly  = new Set([SearchCriterion.method, SearchCriterion.type, SearchCriterion.title])
    const responseCriteria = new Set([SearchCriterion.response])
    const statusCriteria = new Set([SearchCriterion.status])
    const activityCriteria = new Set([SearchCriterion.activityType])

    describe('model search', () => {
      it('target not found', () => {
        const actual = apiTestModel.search('you will not find me anywhere in there, nuh uh')
        expect(actual).toBeDefined()
        const methods = allMethods(actual.tags)
        expect(Object.entries(methods).length).toEqual(0)
        expect(Object.entries(actual.types).length).toEqual(0)
      })

      it('search anywhere', () => {
        const actual = apiTestModel.search('dashboard', modelAndTypeNames)
        const methods = allMethods(actual.tags)
        expect(Object.entries(methods).length).toEqual(34)
        expect(Object.entries(actual.types).length).toEqual(15)
      })

      it('search for word', () => {
        let actual = apiTestModel.search('\\bdashboard\\b', modelAndTypeNames)
        let methods = allMethods(actual.tags)
        expect(Object.entries(methods).length).toEqual(7)
        expect(Object.entries(actual.types).length).toEqual(1)
        actual = apiTestModel.search('\\bdashboardbase\\b', modelAndTypeNames)
        methods = allMethods(actual.tags)
        expect(Object.entries(methods).length).toEqual(1)
        expect(Object.entries(actual.types).length).toEqual(1)
      })

      it('title search', () => {
        let actual = apiTestModel.search('\\bdashboard\\b', titleOnly)
        expect(Object.entries(allMethods(actual.tags)).length).toEqual(0)
        expect(Object.entries(actual.types).length).toEqual(1)
      })

      it('just model names', () => {
        let actual = apiTestModel.search('\\bdashboard\\b', modelNames)
        expect(Object.entries(allMethods(actual.tags)).length).toEqual(1)
        expect(Object.entries(actual.types).length).toEqual(0)
      })

      it('deprecated items', () => {
        let actual = apiTestModel.search('deprecated', statusCriteria)
        expect(Object.entries(allMethods(actual.tags)).length).toEqual(6)
        expect(Object.entries(actual.types).length).toEqual(4)
      })

      it('beta items', () => {
        let actual = apiTestModel.search('beta', statusCriteria)
        expect(Object.entries(allMethods(actual.tags)).length).toEqual(204)
        expect(Object.entries(actual.types).length).toEqual(99)
      })

      it('stable items', () => {
        let actual = apiTestModel.search('stable', statusCriteria)
        expect(Object.entries(allMethods(actual.tags)).length).toEqual(153)
        expect(Object.entries(actual.types).length).toEqual(88)
      })

      it('db queries', () => {
        let actual = apiTestModel.search('db_query', activityCriteria)
        expect(Object.entries(allMethods(actual.tags)).length).toEqual(35)
        expect(Object.entries(actual.types).length).toEqual(0)
      })
    })

    describe('response search', () => {
      it('find binary responses', () => {
        let actual = apiTestModel.search('binary', responseCriteria)
        expect(Object.entries(allMethods(actual.tags)).length).toEqual(6)
        expect(Object.entries(actual.types).length).toEqual(0)
      })

      it('find rate limited responses', () => {
        let actual = apiTestModel.search('429', responseCriteria)
        expect(Object.entries(allMethods(actual.tags)).length).toEqual(7)
        expect(Object.entries(actual.types).length).toEqual(0)
      })
    })

    describe('criteria transformations', () => {
      it('criterion name array to criteria', () => {
        let expected = new Set([SearchCriterion.method, SearchCriterion.type, SearchCriterion.name])
        // this declaration pattern assures correct enum names
        let names: SearchCriterionTerm[] = ['method', 'type', 'name']
        let actual = CriteriaToSet(names)
        expect(actual).toEqual(expected)
      })

      it('criteria to criterion name array', () => {
        let criteria = new Set([SearchCriterion.method, SearchCriterion.type, SearchCriterion.name])
        let expected: SearchCriterionTerm[] = ['method', 'type', 'name']
        let actual = SetToCriteria(criteria)
        expect(actual).toEqual(expected)
      })

      it('strings to criteria', () => {
        let expected = new Set([SearchCriterion.method, SearchCriterion.type, SearchCriterion.name])
        let values = ['method', 'type', 'name']
        let names = values as SearchCriterionTerm[]
        let actual = CriteriaToSet(names)
        expect(actual).toEqual(expected)
      })

      it('criteria is case insensitive', () => {
        let expected = new Set([SearchCriterion.method, SearchCriterion.type, SearchCriterion.name])
        let values = ['Method', 'Type', 'name']
        let names = values as SearchCriterionTerm[]
        let actual = CriteriaToSet(names)
        expect(actual).toEqual(expected)
      })

      it('criteria to strings', () => {
        let criteria = new Set([SearchCriterion.method, SearchCriterion.type, SearchCriterion.name])
        let expected = ['method', 'type', 'name']
        let actual = SetToCriteria(criteria)
        expect(actual).toEqual(expected)
      })
    })
  })

  describe('tagging', () => {
    it('methods are tagged', () => {
      let actual = apiTestModel.tags
      expect(Object.entries(actual).length).toEqual(26)
    })

    it('methods are in the right tag', () => {
      let actual = apiTestModel.tags['Theme']
      expect(Object.entries(actual).length).toEqual(11)
    })

  })
})
