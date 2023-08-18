#!/usr/bin/env python3
# python scripts\build.py
from urllib import request, error
import os
import shutil
import zipfile
from pathlib import Path

# MAAjsonViever release版号
RELEASES_TAG = "v1.0.9"

SAVEPATH = os.path.join(Path(__file__).parent, f'{RELEASES_TAG}.zip')
projectDir: str = os.getcwd()
serverDir = os.path.join(projectDir, r'packages\server')
zipurl: str = f'https://github.com/MaaAssistantArknights/MaaJsonViewer/releases/download/{RELEASES_TAG}/MaaJsonViewer-win-{RELEASES_TAG}.zip'


def reporthook(a, b, c):
    '''回调函数
    @a:已经下载的数据块 
    @b:数据块的大小 
    @c:远程文件的大小 
    '''
    per = 100.0*a*b/c
    if per > 100:
        per = 100
    print(
        f'---- {round(a*b/1024/1024,2)}MB / {round(c/1024/1024,2)}MB, {round(per,2)}%')


def extractlib(zipPath: str, libPath: str):
    if os.path.exists(zipPath) is False:
        print(f'{zipPath} file not found')
        return
    if zipfile.is_zipfile(zipPath) is False:
        print(f'{zipPath} this file not a zip file')
        return
    with zipfile.ZipFile(zipPath, 'r') as zfile:
        zfList = zfile.namelist()
        for item in zfList[:]:
            if 'web' in item:
                zfList.remove(item)
            elif '.exe' in item:
                zfList.remove(item)
        for id, fileName in enumerate(zfList):
            zfile.extract(fileName, path=libPath)
        zfile.close()


def npmIstall():
    '''下载npm package'''
    print(f'git submodule MaaJSLoader')
    os.system('git submodule update --init --recursive')
    print(f'project npm i')
    os.system('npm i')


if __name__ == "__main__":
    shutil.copyfile(f'{serverDir}/assets\config.json',
                    f'{serverDir}\config.json')
    if os.path.exists(f'{projectDir}/node_modules') is False:
        print(f'start install npm package')
        npmIstall()
        print(f'successed install npm package')
    if os.path.exists(f'{serverDir}\library') is False:
        try:
            print(f'download MaaJsonViever-release{RELEASES_TAG}.zip')
            request.urlretrieve(zipurl, SAVEPATH, reporthook)
            extractlib(SAVEPATH, serverDir)
            print(f'success!!')
        except error.URLError as e:
            print(
                f'{e}\ndownload MaaJsonViever-release{RELEASES_TAG} failed\n请手动下载release包并解压!!')
    if os.path.exists(f'{serverDir}\library') is True:
        os.remove(SAVEPATH)
