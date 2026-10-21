import ExpoModulesCore
import UIKit

final class DuoColumnView: ExpoView {
  private var appliedWidth: CGFloat = -1

  func applyWidth(_ width: CGFloat) {
    guard abs(width - appliedWidth) >= 0.5 else { return }
    appliedWidth = width
    setStyleSize(NSNumber(value: Double(width)), height: nil)
  }
}

final class DuoReadableView: ExpoView {
  let onPosture = EventDispatcher()
  private let slider = UIView()
  private var status = "unknown"
  private var angle: CGFloat = 180
  private var startAngle: CGFloat = 85
  // A continuous drag tops out near 174.7° before the hinge jumps to fullyOpen at 180°.
  private let flatAngle: CGFloat = 175
  private var activationAngle: CGFloat?
  private var wasInner = false
  private var maxWidth: CGFloat = 600
  private var lastReport: [String: AnyHashable] = [:]

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    addSubview(slider)
    if #available(iOS 27.1, *) {
      addInteraction(
        UIHingeInteraction { [weak self] _, update in
          self?.hingeChanged(update.hinge)
        })
    }
  }

  func setStartAngle(_ value: Double) {
    startAngle = CGFloat(value)
    applyFrame()
  }

  func setMaxWidth(_ value: Double) {
    maxWidth = CGFloat(value)
    applyFrame()
  }

  override func mountChildComponentView(_ childComponentView: UIView, index: Int) {
    slider.insertSubview(childComponentView, at: index)
    applyFrame()
  }

  override func unmountChildComponentView(_ childComponentView: UIView, index: Int) {
    childComponentView.removeFromSuperview()
  }

  override func layoutSubviews() {
    super.layoutSubviews()
    slider.bounds = bounds
    slider.center = CGPoint(x: bounds.midX, y: bounds.midY)
    trackActivation()
    report()
    applyFrame()
  }

  override func safeAreaInsetsDidChange() {
    super.safeAreaInsetsDidChange()
    report()
    applyFrame()
  }

  @available(iOS 27.1, *)
  private func hingeChanged(_ hinge: UIHinge?) {
    guard let hinge else {
      status = "none"
      report()
      return
    }
    switch hinge.status {
    case .closed: status = "closed"
    case .partiallyOpen: status = "partiallyOpen"
    case .fullyOpen: status = "fullyOpen"
    default: status = "unknown"
    }
    angle = hinge.angle * 180 / .pi
    trackActivation()
    report()
    applyFrame()
  }

  private func division() -> CGRect? {
    guard #available(iOS 27.1, *) else { return nil }
    return reservedRegions(kind: .division).first(where: \.isActive)?.frame
  }

  private func hingeDivision() -> CGRect? {
    guard #available(iOS 27.1, *) else { return nil }
    return reservedRegions(kind: .division, options: .includeInactive)
      .map(\.frame)
      .first { $0.minX > bounds.minX && $0.maxX < bounds.maxX }
  }

  private func trackActivation() {
    let inner = hingeDivision() != nil
    defer { wasInner = inner }
    guard inner, !wasInner, status != "fullyOpen", angle < 180 else { return }
    activationAngle = min(flatAngle - 1, angle)
  }

  private func targetFrame() -> (left: CGFloat, width: CGFloat) {
    let safeMinX = safeAreaInsets.left
    let safeMaxX = bounds.width - safeAreaInsets.right
    let safeWidth = max(0, safeMaxX - safeMinX)
    let centeredWidth = min(maxWidth, safeWidth)
    let centered = (left: safeMinX + (safeWidth - centeredWidth) / 2, width: centeredWidth)
    guard status != "fullyOpen", let division = hingeDivision() else { return centered }
    let right = (left: division.maxX, width: max(0, safeMaxX - division.maxX))
    let from = activationAngle ?? startAngle
    let progress = min(1, max(0, (angle - from) / (flatAngle - from)))
    return (
      left: right.left + (centered.left - right.left) * progress,
      width: right.width + (centered.width - right.width) * progress
    )
  }

  private func applyFrame() {
    guard bounds.width > 0 else { return }
    let frame = targetFrame()
    slider.transform = CGAffineTransform(translationX: frame.left, y: 0)
    for case let column as DuoColumnView in slider.subviews {
      column.applyWidth(frame.width)
    }
  }

  private func report() {
    var payload: [String: AnyHashable] = [
      "angle": Double(angle.rounded()),
      "safeLeft": Double(safeAreaInsets.left),
      "safeRight": Double(safeAreaInsets.right),
      "status": status,
      "width": Double(bounds.width),
    ]
    if let division = division() {
      payload["divisionMinX"] = Double(division.minX)
      payload["divisionMaxX"] = Double(division.maxX)
    }
    guard payload != lastReport, bounds.width > 0 else { return }
    lastReport = payload
    onPosture(payload)
  }
}
