package rtl

import (
	"fmt"
	"strconv"
	"strings"

	json "github.com/json-iterator/go"
)

// type alias to string slice, this is needed for custom serialization
type DelimString []string

// UnmarshalJSON is custom json unmarshaling for DelimString type
// It expects json string as input, and split it by comma to multiple strings.
// example:
//
//	"one,two,three" -> DelimString{"one","two","three"}
func (s *DelimString) UnmarshalJSON(b []byte) error {
	// unmarshal the original value, this supposed to be string
	var orig *string
	if err := json.Unmarshal(b, &orig); err != nil {
		return err
	}
	// the value can be nil, if 'null' json value is provided
	if orig == nil {
		return nil
	}
	// split the value to multiple strings
	*s = strings.Split(*orig, ",")
	return nil
}

// MarshalJSON is custome json marshaling for DelimString type
// It marshals the DelimString (slice of strings) to comma separated json string value
// example:
// DelimString{"one","two","three"} -> "one,two,three"
func (s DelimString) MarshalJSON() ([]byte, error) {
	// convert to slice of strings
	orig := []string(s)
	if orig == nil {
		return json.Marshal(orig)
	}
	// marshal as comma separated string
	return json.Marshal(strings.Join(orig, ","))
}

// type alias to in64 slice, this is needed for custom serialization
type DelimInt64 []int64

// UnmarshalJSON is custom json unmarshaling for DelimInt64 type
// It expects string as input, split the string by comma and convert it to DelimInt64 (slice of int64)
// example:
//
//	"1,2,3" -> DelimInt64{1,2,3}
func (i *DelimInt64) UnmarshalJSON(b []byte) error {
	// unmarshal the provided value as string
	var orig *string
	if err := json.Unmarshal(b, &orig); err != nil {
		return err
	}

	if orig == nil {
		return nil
	}

	// split by comma
	splits := strings.Split(*orig, ",")
	var res DelimInt64
	if len(splits) > 0 {
		res = make(DelimInt64, len(splits))
	}

	// convert each string to int64
	for i, s := range splits {
		num, err := strconv.ParseInt(s, 10, 64)
		if err != nil {
			return err
		}
		res[i] = num
	}
	*i = res
	return nil
}

// MarshalJSON is custom json marshaling for DelimInt64 type
// It marshals the DelimInt64 (slice of int64) to comma separated json string value
// example:
//
//	DelimInt64{1,2,3} -> "1,2,3"
func (i DelimInt64) MarshalJSON() ([]byte, error) {
	// convert to slice of ints
	elems := []int64(i)
	if elems == nil {
		return json.Marshal(elems)
	}

	// code below is adopted from string.Join function
	switch len(elems) {
	case 0:
		return json.Marshal("")
	case 1:
		return json.Marshal(fmt.Sprintf("%v", elems[0]))
	}
	n := len(",") * (len(elems) - 1)
	for i := 0; i < len(elems); i++ {
		n += len(strconv.FormatInt(elems[i], 10))
	}

	var b strings.Builder
	b.Grow(n)
	b.WriteString(strconv.FormatInt(elems[0], 10))
	for _, num := range elems[1:] {
		b.WriteString(",")
		b.WriteString(strconv.FormatInt(num, 10))
	}
	return json.Marshal(b.String())
}
