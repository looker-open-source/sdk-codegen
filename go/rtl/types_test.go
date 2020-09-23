package rtl

import (
	"encoding/json"
	"reflect"
	"testing"
)

func TestDelimString_MarshalJSON(t *testing.T) {
	tests := []struct {
		name    string
		s       DelimString
		want    []byte
		wantErr bool
	}{
		{
			name:    "basic",
			s:       DelimString{"one", "two"},
			want:    []byte("\"one,two\""),
			wantErr: false,
		},
		{
			name:    "nil",
			s:       nil,
			want:    []byte("null"),
			wantErr: false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := json.Marshal(tt.s)
			if (err != nil) != tt.wantErr {
				t.Errorf("MarshalJSON() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !reflect.DeepEqual(got, tt.want) {
				t.Errorf("MarshalJSON() got = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestDelimString_UnmarshalJSON(t *testing.T) {
	type args struct {
		b []byte
	}
	tests := []struct {
		name    string
		s       DelimString
		args    args
		want    DelimString
		wantErr bool
	}{
		{
			name: "basic",
			s:    DelimString{},
			args: args{
				b: []byte("\"one,two\""),
			},
			want:    DelimString{"one", "two"},
			wantErr: false,
		},
		{
			name: "null",
			args: args{
				b: []byte("null"),
			},
			want:    nil,
			wantErr: false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if err := json.Unmarshal(tt.args.b, &tt.s); (err != nil) != tt.wantErr {
				t.Errorf("UnmarshalJSON() error = %v, wantErr %v", err, tt.wantErr)
			}
			if !reflect.DeepEqual(tt.s, tt.want) {
				t.Errorf("UnmarshalJSON() got = %v, want %v", tt.s, tt.want)
			}
		})
	}
}

func TestDelimInt64_MarshalJSON(t *testing.T) {
	tests := []struct {
		name    string
		i       DelimInt64
		want    []byte
		wantErr bool
	}{
		{
			name:    "basic",
			i:       DelimInt64{1, 2, 3},
			want:    []byte("\"1,2,3\""),
			wantErr: false,
		},
		{
			name:    "nil",
			i:       nil,
			want:    []byte("null"),
			wantErr: false,
		},
		{
			name:    "one element",
			i:       DelimInt64{11},
			want:    []byte("\"11\""),
			wantErr: false,
		},
		{
			name:    "two elements",
			i:       DelimInt64{11, 22},
			want:    []byte("\"11,22\""),
			wantErr: false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := json.Marshal(tt.i)
			if (err != nil) != tt.wantErr {
				t.Errorf("MarshalJSON() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !reflect.DeepEqual(got, tt.want) {
				t.Errorf("MarshalJSON() got = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestDelimInt64_UnmarshalJSON(t *testing.T) {
	type args struct {
		b []byte
	}
	tests := []struct {
		name    string
		i       DelimInt64
		args    args
		want    DelimInt64
		wantErr bool
	}{
		{
			name: "basic",
			i:    nil,
			args: args{
				b: []byte("\"1,2,3\""),
			},
			want: DelimInt64{1,2,3},
			wantErr: false,
		},
		{
			name: "null",
			i:    nil,
			args: args{
				b: []byte("null"),
			},
			want: nil,
			wantErr: false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if err := json.Unmarshal(tt.args.b, &tt.i); (err != nil) != tt.wantErr {
				t.Errorf("UnmarshalJSON() error = %v, wantErr %v", err, tt.wantErr)
			}
			if !reflect.DeepEqual(tt.i, tt.want) {
				t.Errorf("MarshalJSON() got = %v, want %v", tt.i, tt.want)
			}
		})
	}
}
