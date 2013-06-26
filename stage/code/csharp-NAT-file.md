---
layout: page
section: Code
category: Favorite
date: 2013-06-26
title: "C#读写局域网文件"
description: "C#读写局域网文件"
summary: "C#读写局域网文件"
---
 
<label></label>
    public static bool connectState(string path,string userName,string passWord)
    {
        bool Flag = false;
        Process proc = new Process();
        try
        {
            proc.StartInfo.FileName = "cmd.exe";
            proc.StartInfo.UseShellExecute = false;
            proc.StartInfo.RedirectStandardInput = true;
            proc.StartInfo.RedirectStandardOutput=true;
            proc.StartInfo.RedirectStandardError=true;
            proc.StartInfo.CreateNoWindow=true;
            proc.Start();
            string dosLine = @"net use " + path + " /User:" + userName + " " + passWord + " /PERSISTENT:YES";
            proc.StandardInput.WriteLine(dosLine);
            proc.StandardInput.WriteLine("exit");
            while (!proc.HasExited)
            {
                proc.WaitForExit(1000);
            }
            string errormsg = proc.StandardError.ReadToEnd();
            proc.StandardError.Close();
            if (string.IsNullOrEmpty(errormsg))
            {
                Flag = true;
            }
            else
            {
                throw new Exception(errormsg);
            }
        }
        catch (Exception ex)
        {
            LogHelper.Error("连接"+path+"发生错误！");
            LogHelper.Error(ex.Message);
        }
        finally
        {
            proc.Close();
            proc.Dispose();
        }
        return Flag;
    }

使用方法：

    bool status = false;
    //连接共享文件夹
    status = NetworkConnection.connectState("\\192.168.1.110\test", UserName, Password);
    if (status)
    {
        FileInfo file = new FileInfo("\\192.168.1.110\test\test.txt");
    }