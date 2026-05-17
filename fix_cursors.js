const fs = require('fs');
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx')) { 
      results.push(file);
    }
  });
  return results;
}

const files = walk('frontend/src/components');
files.push('frontend/src/App.jsx');

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let original = content;

  // Since regex across JSX is tough, we can do this line by line as an approximation.
  // We'll look for `className="...` on lines that also contain `onClick=`.
  // If it contains both, and doesn't contain `cursor-pointer` inside className, we add it.
  
  // Actually, some elements might have `onClick` but className is on a previous line.
  // Instead of line-by-line, let's use a regex that matches JSX tags.
  // A JSX tag: `<` followed by tag name, followed by attributes, followed by `>` or `/>`
  const tagRegex = /<([a-zA-Z0-9.]+)([^>]*?onClick={[^>]*?>)/gs;
  
  content = content.replace(tagRegex, (match, tagName, rest) => {
    // If it's not a button or a link, let's add cursor-pointer
    // Actually, adding cursor-pointer to buttons/links is harmless too.
    if (match.includes('cursor-pointer')) return match;
    
    // Check if it has a className attribute
    const classNameMatch = match.match(/className=["'{]/);
    if (classNameMatch) {
      // It has a className attribute. Let's inject cursor-pointer
      // Replace the first opening quote of className with quote + cursor-pointer + space
      return match.replace(/className=(["'`])/, 'className=$1cursor-pointer ');
    } else {
      // It doesn't have a className. Add one.
      return `<${tagName} className="cursor-pointer" ${rest}`;
    }
  });

  if (content !== original) {
    fs.writeFileSync(f, content);
    console.log('Added cursor-pointer in:', f);
  }
});
