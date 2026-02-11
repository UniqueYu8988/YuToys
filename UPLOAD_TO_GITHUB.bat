@echo off
setlocal enabledelayedexpansion

:: 设置控制台编码为 UTF-8
chcp 65001 >nul

echo ==================================================
echo         小羽桌面助理 - GitHub 一键交付脚本
echo ==================================================
echo.

:: 1. 检查 Git 是否安装
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Git 环境，请先安装 Git。
    pause
    exit /b
)

:: 2. 显示当前状态
echo [状态] 正在扫描文件变更...
git status
echo.

:: 3. 询问是否继续
set /p confirm="确认要将变更上传至 GitHub 吗？(Y/N): "
if /i "%confirm%" neq "Y" (
    echo [取消] 操作已中止喵。
    pause
    exit /b
)

:: 4. 执行上传
echo [进程] 正在准备包裹...
git add .

set /p msg="请输入本次更新记录 (留空则使用默认): "
if "%msg%"=="" set msg="YuToys V1.6.1 - 小羽桌面助理完善版"

echo [进程] 正在盖章: %msg%
git commit -m %msg%

echo [进程] 正在穿越传送门上传至 GitHub (这可能需要一点时间喵)...
git push

if %errorlevel% equ 0 (
    echo.
    echo ==================================================
    echo    ✨ 恭喜主人！代码已成功送达 GitHub 基地喵！ ✨
    echo ==================================================
) else (
    echo.
    echo [错误] 上传失败了喵... 请检查网络连接或权限设置。
)

pause
