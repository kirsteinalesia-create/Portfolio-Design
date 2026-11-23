import Foundation

/// A single water-drinking entry — a timestamped amount in millilitres.
struct HydrationEntry: Codable, Identifiable, Equatable, Hashable {
    let id: UUID
    let timestamp: Date
    /// Amount in millilitres.
    let amount: Int

    init(id: UUID = UUID(), timestamp: Date = Date(), amount: Int) {
        self.id = id
        self.timestamp = timestamp
        self.amount = amount
    }

    /// The hour-of-day (0…23) in the user's current calendar.
    var hour: Int {
        Calendar.current.component(.hour, from: timestamp)
    }
}
