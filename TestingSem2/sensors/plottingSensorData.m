clc;
close all;
clear variables;

sensorData = readtable('sensorData.csv', 'PreserveVariableNames',true);

sensorData.Time = sensorData.Time/1000;
sensorData.('Velocity x-axis') = cumtrapz(sensorData.Time, sensorData.('Linear acceleration x-axis'));
sensorData.('Velocity y-axis') = cumtrapz(sensorData.Time, sensorData.('Linear acceleration y-axis'));
sensorData.('Velocity z-axis') = cumtrapz(sensorData.Time, sensorData.('Linear acceleration z-axis'));
sensorData.('Position x-axis (in m)') = cumtrapz(sensorData.Time, sensorData.('Velocity x-axis'));
sensorData.('Position y-axis (in m)') = cumtrapz(sensorData.Time, sensorData.('Velocity y-axis'));
sensorData.('Position z-axis (in m)') = cumtrapz(sensorData.Time, sensorData.('Velocity z-axis'));

fitlm(sensorData.Time, sensorData.('Velocity x-axis'))

sensorData.Time = seconds(sensorData.Time);
sensorData = table2timetable(sensorData);

figure('Name', 'Oriëntatie apparaat volgens de x-as, y-as en z-as', 'NumberTitle', 'off')
s = stackedplot(sensorData, {'Orientation x-axis (in degrees)', 'Orientation y-axis (in degrees)', 'Orientation z-axis (in degrees)'});
s.LineWidth = 2;

figure('Name', 'Positie apparaat volgens de x-as, y-as en z-as', 'NumberTitle', 'off')
s = stackedplot(sensorData, {'Position x-axis (in m)', 'Position y-axis (in m)', 'Position z-axis (in m)'});
s.LineWidth = 2;