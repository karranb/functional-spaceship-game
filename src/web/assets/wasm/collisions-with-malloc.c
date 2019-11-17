#include <math.h>
#include <stdbool.h>
#include <stdlib.h>
#include <stdio.h>


#define WASM_EXPORT __attribute__((visibility("default")))


double getClosestPoint(double unrotatedBulletPoint, double spaceshipPoint, double spaceshipSize) {
  if (unrotatedBulletPoint < spaceshipPoint) {
    return spaceshipPoint;
  }
  if (unrotatedBulletPoint > spaceshipPoint + spaceshipSize) {
   return spaceshipPoint + spaceshipSize;
  }
  return unrotatedBulletPoint;
}

WASM_EXPORT
bool checkCollisionSquareCircle(double cX, double cY, double cW, double sX, double sY, double sW, double sH, double sR) {
  double squareX = sX - sW / 2;
  double squareY = sY - sH / 2;

  double unrotatedCircleX = cos(sR) * (cX - sX) - sin(sR) * (cY - sY) + sX;
  double unrotatedCircleY = sin(sR) * (cX - sX) + cos(sR) * (cY - sY) + sY;

  double closestX = getClosestPoint(unrotatedCircleX, squareX, sW);
  double closestY = getClosestPoint(unrotatedCircleY, squareY, sH);
  double distance = sqrt(pow(unrotatedCircleY - closestY, 2) + pow(unrotatedCircleX - closestX, 2));
  return distance < cW / 2;
}

double * rotateCorner(double px, double py, double cx, double cy, double angleSin, double angleCos) {
  double * corners = (double *)malloc(2 * sizeof(double));
  corners[0] = px + (cx * angleCos) - (cy * angleSin);
  corners[1] = py + (cx + angleSin) + (cy * angleCos);
  return corners;
}

double *** createLines(double px, double py, double halfWidth, double halfHeight, double pr) {
  double angleSin = sin(pr);
  double angleCos = cos(pr);
  double **corners = (double **)malloc(4 * 2 * sizeof(double *));
  corners[0] = rotateCorner(px, py, halfWidth, halfHeight, angleSin, angleCos);
  corners[1] = rotateCorner(px, py, halfWidth, -halfHeight, angleSin, angleCos);
  corners[2] = rotateCorner(px, py, -halfWidth, halfHeight, angleSin, angleCos);
  corners[3] = rotateCorner(px, py, -halfWidth, -halfHeight, angleSin, angleCos);
  int i;
  double ***lines = (double ***)malloc(4 * sizeof(double **));
  for (i = 0; i < 4; i++) {
    double **line = (double **)malloc(2 * sizeof(double *));
    line[0] = corners[i];
    line[1] = corners[(i + 1) % 4];
    lines[i] = line;
  }
  return lines;
}

double getDet(double * p1, double * p2) {
  return ((p1[2] - p1[0]) * (p2[1] - p2[3])) - ((p2[0] - p2[2]) * (p1[3] - p1[1]));
}

double getLambda(double * p1, double * p2, double det) {
  return (((p2[1] - p2[3]) * (p2[0] - p1[0])) + ((p2[2] - p2[0]) * (p2[1] - p1[1]))) / det;
}

double getGamma(double * p1, double * p2, double det) {
  return (((p1[1] - p1[3]) * (p2[0] - p1[0])) + ((p1[2] - p1[0]) * (p2[1] - p1[1]))) / det;
}

bool checkPointsCollisions(double * p1, double * p2) {
  double det = getDet(p1, p2);
  if (det == 0) return false;
  double lambda = getLambda(p1, p2, det);
  double gamma = getGamma(p1, p2, det);
  return lambda > 0 && lambda < 1 && gamma > 0 && gamma < 1;
}

bool checkCollisionBetweenPolygons(
  double p1X, double p1Y, double p1W, double p1H, double p1R,
  double p2X, double p2Y, double p2W, double p2H, double p2R
) {
  double *** lines1 = createLines(p1X, p1Y, p1W / 2, p1H / 2, p1R);
  double *** lines2 = createLines(p2X, p2Y, p2W / 2, p2H / 2, p2R);

  int i;
  int j;
  for (i = 0; i < 4; i++) {
    double * l1Points = (double *)malloc(4 * sizeof(double));
    l1Points[0] = lines1[i][0][0];
    l1Points[1] = lines1[i][0][1];
    l1Points[2] = lines1[i][1][0];
    l1Points[3] = lines1[i][1][1];
    for (j = 0; j < 4; j++) {
      double * l2Points = (double *)malloc(4  * sizeof(double));
      l2Points[0] = lines2[j][0][0];
      l2Points[1] = lines2[j][0][1];
      l2Points[2] = lines2[j][1][0];
      l2Points[3] = lines2[j][1][1];
      if (checkPointsCollisions(l1Points, l2Points)) return true;
    } 
  }
  return false;
}

int main() {
  printf("%d\n", checkCollisionBetweenPolygons(
    748.0028779543477, 450.1072545326296, 44.7, 32.9, 3.0879396496560054,
    748.0028779543477, 450.1072545326296, 44.7, 32.9, 3.0879396496560054
  ));
  return 0;
}