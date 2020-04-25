clc;
close all;
clear variables;

sensorData = readtable('sensorData.csv', 'PreserveVariableNames',true);

sensorData.('Velocity x-axis') = cumtrapz(sensorData.Time, sensorData.('Acceleration x-axis'));
sensorData.('Velocity y-axis') = cumtrapz(sensorData.Time, sensorData.('Acceleration y-axis'));
sensorData.('Velocity z-axis') = cumtrapz(sensorData.Time, sensorData.('Acceleration z-axis'));
sensorData.('Position x-axis (in m)') = cumtrapz(sensorData.Time, sensorData.('Velocity x-axis'));
sensorData.('Position y-axis (in m)') = cumtrapz(sensorData.Time, sensorData.('Velocity y-axis'));
sensorData.('Position z-axis (in m)') = cumtrapz(sensorData.Time, sensorData.('Velocity z-axis'));

sensorData.Time = milliseconds(sensorData.Time);
sensorData = table2timetable(sensorData);

figure('Name', 'Oriëntatie smartphone volgens de x-as, y-as en z-as', 'NumberTitle', 'off')
s = stackedplot(sensorData, {'Orientation x-axis (in degrees)', 'Orientation y-axis (in degrees)', 'Orientation z-axis (in degrees)'});
s.LineWidth = 2;

figure('Name', 'Positie smartphone volgens de x-as, y-as en z-as', 'NumberTitle', 'off')
s = stackedplot(sensorData, {'Position x-axis (in m)', 'Position y-axis (in m)', 'Position z-axis (in m)'});
s.LineWidth = 2;