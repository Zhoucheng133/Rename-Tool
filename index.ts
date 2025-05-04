import readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';

function ask(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer: any) => {
      rl.close();
      resolve(answer);
    });
  });
}

function checkDir(dir: string): string[] | null{
  if(dir.startsWith("\"") || dir.startsWith("\'")){
    dir=dir.slice(1, -1);
  }
  try {
    const resolvedPath = path.resolve(dir);
    const stat = fs.statSync(resolvedPath);
    if(stat.isDirectory()){
      const list = fs.readdirSync(dir);
      let results: string[]=[];
      for (const file of list) {
        const filePath = path.join(dir, file);
        results.push(path.basename(filePath));
      }
      return results;
    }
  } catch (err) {
  }
  return null;
}

function publicPrefix(ls: string[]): string{
  if (ls.length === 0) return "";

  let prefix = ls[0];
  for (let i = 1; i < ls.length; i++) {
    while (ls[i].indexOf(prefix) !== 0) {
      prefix = prefix.slice(0, -1);
      if (prefix === "") return "";
    }
  }
  return prefix;
}

function publicSuffix(ls: string[]): string{
  if (ls.length === 0) return "";

  let suffix = ls[0];
  for (let i = 1; i < ls.length; i++) {
    while (!ls[i].endsWith(suffix)) {
      suffix = suffix.slice(1); // 从后面移除一个字符
      if (suffix === "") return "";
    }
  }
  return suffix;
}

function renameHandler(dir: string, file: string,  prefix: string, suffix: string, len: number){
  if (!file.startsWith(prefix) || !file.endsWith(suffix)) {
    console.log("文件名不符合要求，未进行重命名");
    return;
  }
  const middlePart = file.slice(prefix.length, file.length - suffix.length);
  if (middlePart.length > len) {
    console.log("中间部分的长度大于指定的长度，未进行重命名");
    return;
  }
  const newMiddlePart = middlePart.padStart(len, "0");
  const newFileName = prefix + newMiddlePart + suffix;
  const oldFilePath = path.join(dir, file);
  const newFilePath = path.join(dir, newFileName);
  try {
    fs.renameSync(oldFilePath, newFilePath);
    console.log(`文件已重命名为: ${newFileName}`);
  } catch (error) {
    console.error("重命名文件时出错:", error);
  }
}

async function main() {
  const dir=await ask("目录: ");
  const ls=checkDir(dir);
  if(ls==null){
    console.log("路径不合法或指向的是一个文件");
    return;
  }
  const suffix=publicPrefix(ls);
  const prefix=publicSuffix(ls);
  const len=ls.length.toString().length

  console.log("\"#\"代替集数");
  console.log(`${suffix}#${prefix}`);
  
  ls.forEach((file)=>{
    renameHandler(dir, file, prefix, suffix, len)
  })

}

main();