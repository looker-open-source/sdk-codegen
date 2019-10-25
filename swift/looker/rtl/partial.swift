// from https://josephduffy.co.uk/partial-in-swift
// TODO not currently used and not sure it makes sense

import Foundation

struct Partial<Wrapped>: CustomStringConvertible, CustomDebugStringConvertible {

    enum Error<ValueType>: Swift.Error {
        case missingKey(KeyPath<Wrapped, ValueType>)
        case invalidValueType(key: KeyPath<Wrapped, ValueType>, actualValue: Any)
    }

    private var values: [PartialKeyPath<Wrapped>: Any?] = [:]

    private var backingValue: Wrapped? = nil

    var description: String {
        let backingValueDescription: String

        if let backingValue = backingValue as? CustomStringConvertible {
            backingValueDescription = backingValue.description
        } else {
            backingValueDescription = String(describing: backingValue)
        }

        return "<\(type(of: self)) values=\(values.description); backingValue=\(backingValueDescription)>"
    }

    var debugDescription: String {
        if let backingValue = backingValue {
            return debugDescription(utilising: backingValue)
        } else {
            return "<\(type(of: self)) values=\(values.debugDescription); backingValue=\(backingValue.debugDescription))>"
        }
    }

    init(backingValue: Wrapped? = nil) {
        self.backingValue = backingValue
    }

    func value<ValueType>(for key: KeyPath<Wrapped, ValueType>) throws -> ValueType {
        if let value = values[key] {
            if let value = value as? ValueType {
                return value
            } else if let value = value {
                throw Error.invalidValueType(key: key, actualValue: value)
            }
        } else if let value = backingValue?[keyPath: key] {
            return value
        }

        throw Error.missingKey(key)
    }

    func value<ValueType>(for key: KeyPath<Wrapped, ValueType?>) throws -> ValueType {
        if let value = values[key] {
            if let value = value as? ValueType {
                return value
            } else if let value = value {
                throw Error.invalidValueType(key: key, actualValue: value)
            }
        } else if let value = backingValue?[keyPath: key] {
            return value
        }

        throw Error.missingKey(key)
    }

    func value<ValueType>(for key: KeyPath<Wrapped, ValueType>) throws -> ValueType where ValueType: PartialConvertible {
        if let value = values[key] {
            if let value = value as? ValueType {
                return value
            } else if let partial = value as? Partial<ValueType> {
                return try ValueType(partial: partial)
            } else if let value = value {
                throw Error.invalidValueType(key: key, actualValue: value)
            }
        } else if let value = backingValue?[keyPath: key] {
            return value
        }

        throw Error.missingKey(key)
    }

    func value<ValueType>(for key: KeyPath<Wrapped, ValueType?>) throws -> ValueType where ValueType: PartialConvertible {
        if let value = values[key] {
            if let value = value as? ValueType {
                return value
            } else if let partial = value as? Partial<ValueType> {
                return try ValueType(partial: partial)
            } else if let value = value {
                throw Error.invalidValueType(key: key, actualValue: value)
            }
        } else if let value = backingValue?[keyPath: key] {
            return value
        }

        throw Error.missingKey(key)
    }

    subscript<ValueType>(key: KeyPath<Wrapped, ValueType>) -> ValueType? {
        get {
            return try? value(for: key)
        }
        set {
            /**
             Uses `updateValue(_:forKey:)` to ensure the value is set to `nil`.

             When the subscript is used the key is removed from the dictionary.

             This ensures that the `backingValue`'s value will not be used when
             a `backingValue` is set and a key is explicitly set to `nil`
             */
            values.updateValue(newValue, forKey: key)
        }
    }

    subscript<ValueType>(key: KeyPath<Wrapped, ValueType?>) -> ValueType? {
        get {
            return try? value(for: key)
        }
        set {
            values.updateValue(newValue, forKey: key)
        }
    }

    subscript<ValueType>(key: KeyPath<Wrapped, ValueType>) -> Partial<ValueType> where ValueType: PartialConvertible {
        get {
            if let value = try? self.value(for: key) {
                return Partial<ValueType>(backingValue: value)
            } else if let partial = values[key] as? Partial<ValueType> {
                return partial
            } else {
                return Partial<ValueType>()
            }
        }
        set {
            values.updateValue(newValue, forKey: key)
        }
    }

    subscript<ValueType>(key: KeyPath<Wrapped, ValueType?>) -> Partial<ValueType> where ValueType: PartialConvertible {
        get {
            if let value = try? self.value(for: key) {
                return Partial<ValueType>(backingValue: value)
            } else if let partial = values[key] as? Partial<ValueType> {
                return partial
            } else {
                return Partial<ValueType>()
            }
        }
        set {
            values.updateValue(newValue, forKey: key)
        }
    }

}

extension Partial {

    func debugDescription(utilising instance: Wrapped) -> String {
        var namedValues: [String: Any] = [:]
        var unnamedValues: [PartialKeyPath<Wrapped>: Any] = [:]

        let mirror = Mirror(reflecting: instance)
        for (key, value) in self.values {
            var foundKey = false

            for child in mirror.children {
                if let propertyName = child.label {
                    foundKey = (value as AnyObject) === (child.value as AnyObject)

                    if foundKey {
                        namedValues[propertyName] = value
                        break
                    }
                }
            }

            if !foundKey {
                unnamedValues[key] = value
            }
        }

        return "<\(type(of: self)) values=\(namedValues.debugDescription), \(unnamedValues.debugDescription); backingValue=\(backingValue.debugDescription))>"
    }

}

extension Partial where Wrapped: PartialConvertible {

    var debugDescription: String {
        if let instance = try? Wrapped(partial: self) {
            return debugDescription(utilising: instance)
        } else {
            return "<\(type(of: self)) values=\(values.debugDescription); backingValue=\(backingValue.debugDescription))>"
        }
    }

}

protocol PartialConvertible {

    init(partial: Partial<Self>) throws

}
