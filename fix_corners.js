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

  // Replace rounded-full with rounded-2xl globally
  content = content.replace(/rounded-full/g, 'rounded-2xl');
  
  // Restore rounded-full for <button>
  let buttonRegex = /(<button[^>]*?)rounded-2xl([^>]*?>)/gs;
  while(buttonRegex.test(content)) {
      content = content.replace(buttonRegex, '$1rounded-full$2');
  }
  
  // Restore rounded-full for <input>
  let inputRegex = /(<input[^>]*?)rounded-2xl([^>]*?>)/gs;
  while(inputRegex.test(content)) {
      content = content.replace(inputRegex, '$1rounded-full$2');
  }

  // Restore rounded-full for <a>
  let aRegex = /(<a[^>]*?)rounded-2xl([^>]*?>)/gs;
  while(aRegex.test(content)) {
      content = content.replace(aRegex, '$1rounded-full$2');
  }

  // Restore rounded-full for <Link>
  let linkRegex = /(<Link[^>]*?)rounded-2xl([^>]*?>)/gs;
  while(linkRegex.test(content)) {
      content = content.replace(linkRegex, '$1rounded-full$2');
  }

  // Restore rounded-full for <motion.button>
  let mbuttonRegex = /(<motion\.button[^>]*?)rounded-2xl([^>]*?>)/gs;
  while(mbuttonRegex.test(content)) {
      content = content.replace(mbuttonRegex, '$1rounded-full$2');
  }

  if (content !== original) {
    fs.writeFileSync(f, content);
    console.log('Fixed corners in:', f);
  }
});

let css = fs.readFileSync('frontend/src/index.css', 'utf8');
let newCss = css.replace(/rounded-full md:rounded-3xl/g, 'rounded-2xl md:rounded-3xl');
if (css !== newCss) {
  fs.writeFileSync('frontend/src/index.css', newCss);
  console.log('Fixed corners in index.css');
}
