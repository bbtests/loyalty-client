import { cn, catchError } from '@/lib/utils'

describe('Utils', () => {
  describe('cn function', () => {
    it('merges class names correctly', () => {
      expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
    })

    it('handles conditional classes', () => {
      expect(cn('base-class', { 'conditional-class': true })).toBe('base-class conditional-class')
      expect(cn('base-class', { 'conditional-class': false })).toBe('base-class')
    })

    it('handles multiple conditional classes', () => {
      expect(cn('base', { 'class1': true, 'class2': false, 'class3': true })).toBe('base class1 class3')
    })

    it('handles arrays of classes', () => {
      expect(cn(['class1', 'class2'], 'class3')).toBe('class1 class2 class3')
    })

    it('handles empty inputs', () => {
      expect(cn()).toBe('')
      expect(cn('')).toBe('')
      expect(cn(null, undefined)).toBe('')
    })

    it('handles conflicting Tailwind classes', () => {
      expect(cn('px-2 px-4')).toBe('px-4')
      expect(cn('text-red-500 text-blue-500')).toBe('text-blue-500')
    })

    it('handles complex combinations', () => {
      expect(cn('base', ['array-class'], { 'conditional': true }, 'px-2 px-4')).toBe('base array-class conditional px-4')
    })
  })

  describe('catchError function', () => {
    it('handles error with data object', () => {
      const setFieldError = jest.fn()
      const error = {
        data: {
          email: 'Email is required',
          password: 'Password is too short',
        },
      }

      catchError(error, setFieldError)

      expect(setFieldError).toHaveBeenCalledWith('email', 'Email is required')
      expect(setFieldError).toHaveBeenCalledWith('password', 'Password is too short')
    })

    it('handles error without data', () => {
      const setFieldError = jest.fn()
      const error = { message: 'Something went wrong' }

      catchError(error, setFieldError)

      expect(setFieldError).not.toHaveBeenCalled()
    })

    it('handles null error', () => {
      const setFieldError = jest.fn()

      catchError(null, setFieldError)

      expect(setFieldError).not.toHaveBeenCalled()
    })

    it('handles undefined error', () => {
      const setFieldError = jest.fn()

      catchError(undefined, setFieldError)

      expect(setFieldError).not.toHaveBeenCalled()
    })

    it('handles empty data object', () => {
      const setFieldError = jest.fn()
      const error = { data: {} }

      catchError(error, setFieldError)

      expect(setFieldError).not.toHaveBeenCalled()
    })

    it('handles single field error', () => {
      const setFieldError = jest.fn()
      const error = {
        data: {
          name: 'Name is required',
        },
      }

      catchError(error, setFieldError)

      expect(setFieldError).toHaveBeenCalledTimes(1)
      expect(setFieldError).toHaveBeenCalledWith('name', 'Name is required')
    })

    it('handles non-string error messages', () => {
      const setFieldError = jest.fn()
      const error = {
        data: {
          count: 5,
          active: true,
          items: ['item1', 'item2'],
        },
      }

      catchError(error, setFieldError)

      expect(setFieldError).toHaveBeenCalledWith('count', 5)
      expect(setFieldError).toHaveBeenCalledWith('active', true)
      expect(setFieldError).toHaveBeenCalledWith('items', ['item1', 'item2'])
    })
  })
})
