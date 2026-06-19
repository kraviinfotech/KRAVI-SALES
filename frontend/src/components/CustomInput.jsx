import React from 'react';
import { ReactTransliterate } from 'react-transliterate';
import 'react-transliterate/dist/index.css';

const CustomInput = ({ 
  value, 
  onChange, // Expects a function that takes the new string value
  lang = 'en', 
  type = 'text', 
  component = 'input', // 'input' or 'textarea'
  className = '', 
  placeholder = '', 
  ...props 
}) => {
  // Use a standard input for English or non-text fields
  if (lang === 'en' || type === 'number' || type === 'tel' || type === 'email' || type === 'password') {
    const Tag = component;
    return (
      <Tag
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={className}
        placeholder={placeholder}
        {...props}
      />
    );
  }

  // Use transliteration for Hindi and Marathi
  return (
    <ReactTransliterate
      value={value}
      onChangeText={(text) => onChange(text)}
      lang={lang}
      renderComponent={(renderProps) => {
        const Tag = component;
        return <Tag {...renderProps} className={className} placeholder={placeholder} />;
      }}
      {...props}
    />
  );
};

export default CustomInput;
